package dev.fritz2.remote

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Special [Middleware] to use in at [http] API to provide an authentication
 * for every request. The type-parameter [P] represents the principal information,
 * which contains all login-information needed to authenticate against the external HTTP API.
 * The principal information is held inside and available as flow by calling [data].
 * To use this [Middleware] you need to implement the [addAuthentication] method, where you
 * get the principal information, when available, to add it to your requests.
 * To implement the client side of authentication process you also need to implement the [authenticate] method in which
 * you specify what is needed to authenticate the user (e.g. open up a login modal).
 * When your authentication process is done you have to call the [complete] function and set your
 * principal. Then all requests, that have been initialized while the authentication was running, will be re-executed with the additional
 * authentication information provided by the [addAuthentication] method.
 * When the user logs out you have to call the [clear] function to clear all authentication information.
 */
abstract class Authentication<P> : Middleware {

    private val principalStore = MutableStateFlow<P?>(null)

    private val mutex = Mutex()

    private var state: CompletableDeferred<P>? = null

    final override suspend fun enrichRequest(request: Request): Request =
            addAuthentication(request, state?.await() ?: principalStore.value)

    final override suspend fun handleResponse(response: Response): Response =
        if (statusCodesEnforcingAuthentication.contains(response.status)) {
            mutex.withLock {
                if(state == null || !state!!.isActive) {
                    start()
                }
            }
            response.request.execute()
        } else response

    /**
     * List of HTTP-Status-Codes forcing an authentication.
     * Default is 401 (unauthorized).
     */
    open val statusCodesEnforcingAuthentication: Set<Int> = setOf(401)

    /**
     * Adds the authentication information to all requests by using the given [principal].
     *
     * @param request [Request] to enrich
     * @param principal principle containing authentication information
     * @return enriched [Request]
     */
    abstract fun addAuthentication(request: Request, principal: P?): Request

    /**
     * Returns the current principal information.
     * When the principal is available it is returned.
     * When an authentication-process is running the function is waiting for the process to be finished.
     * Otherwise, it returns null if no authentication-process is running or no principal information is available.
     *
     * @return [P] principal information
     */
    val current: P? get() = principalStore.value

    /**
     * flow of the current principal [P]
     */
    val data: Flow<P?> = principalStore.asStateFlow()

    /**
     * implements the authentication process.
     * E.g. opens up a login-modal or browsing to the login-page.
     */
    abstract fun authenticate()

    /**
     * starts the authentication process.
     */
    fun start() {
        if (state == null) {
            state = CompletableDeferred()
            authenticate()
        }
    }

    /**
     * completes the authentication process by setting the principal.
     * When no authentication process is running it only sets the principal.
     *
     * @param principal principal to set
     */
    fun complete(principal: P) {
        if (state != null) state!!.complete(principal)
        principalStore.value = principal
    }

    /**
     * clears the current principal information.
     * Needed when performing a logout.
     */
    fun clear() {
        state = null
        principalStore.value = null
    }

    /**
     * flow of the information whether the user is authenticated or not
     */
    val authenticated: Flow<Boolean> = data.map { it != null }
}