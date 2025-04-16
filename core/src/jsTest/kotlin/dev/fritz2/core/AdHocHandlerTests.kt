package dev.fritz2.core

import dev.fritz2.renderWithJob
import dev.fritz2.runTest
import kotlinx.browser.document
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import org.w3c.dom.HTMLButtonElement
import kotlin.test.*


class AdHocHandlerTests {

    @Test
    fun givenSomeAdHocHandlerWhenNewValuesAppearOnTheFlowItWillExecuteItsExpression() = runTest {
        val idButton = Id.next()
        var result = 0

        render {
            button(id = idButton) {
                clicks.map { 41 } handledBy { value ->
                    result = value + 1
                }
            }
        }

        delay(50)
        (document.getElementById(idButton) as HTMLButtonElement).click()

        delay(50)
        assertEquals(42, result)
    }

    @Test
    fun cancelAdHocHandlersJobAfterCallingOtherHandlersWontCancelThose() = runTest {
        var busyFlag = true

        val heavyWork = object : RootStore<Boolean>(false, job = Job()) {
            val doWork = handle {
                do {
                    delay(10)
                } while (busyFlag)
                true
            }
        }

        val storeForCanceling = storeOf(false)

        val idButton = Id.next()
        val idWorkState = Id.next()

        render {
            heavyWork.data.render {
                p(id = idWorkState) { +it.toString() }
            }
            storeForCanceling.data.render {
                if (!it) { // job of button will be canceled if `storeForCanceling` is set to `true`
                    button(id = idButton) {
                        clicks handledBy {
                            heavyWork.doWork() // should continue to work after mount-point cancels this ad-hoc handler!
                            storeForCanceling.update(true)
                        }
                    }
                }
            }
        }

        delay(100)
        assertFalse(heavyWork.current)

        (document.getElementById(idButton) as HTMLButtonElement).click()
        delay(100)

        assertTrue(storeForCanceling.current)
        assertNull(document.getElementById(idButton))

        busyFlag = false
        delay(50)
        assertEquals(
            "true",
            document.getElementById(idWorkState)?.textContent,
            "Handler has finished and set state to `true`"
        )
    }


    @Test
    fun testHandlerFinishesAfterJobCancel() = runTest {

        val store1 = storeOf(1)
        val store2 = storeOf(1)

        renderWithJob {
            store1.data.render {
                div {
                    store1.data.filter { it == 1 } handledBy {
                        store1.update(2)
                        delay(20)
                        store2.update(2)
                    }
                }
            }
        }
        delay(50)
        assertEquals(2, store2.current)

    }

    @Test
    fun testHandlerFlowCancellationAfterJobCancel() = runTest {

        val store1 = storeOf(1)
        val store2 = storeOf(1)

        renderWithJob {
            store1.data.render {
                div {
                    store1.data.filter { it == 1 }.onEach {
                        // Do not update stores in flow-chains, only using handlers
                        store1.update(2)
                        delay(20)
                    } handledBy {
                        store2.update(2)
                    }
                }
            }
        }
        delay(50)
        // store2.update was not called, because the div got rerendered while waiting for the delay
        assertEquals(1, store2.current)

    }
}