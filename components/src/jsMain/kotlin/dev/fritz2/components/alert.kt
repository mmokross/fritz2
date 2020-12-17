package dev.fritz2.components

import dev.fritz2.binding.SimpleHandler
import dev.fritz2.components.Status.error
import dev.fritz2.components.Status.info
import dev.fritz2.components.Status.success
import dev.fritz2.components.Status.warning
import dev.fritz2.dom.html.RenderContext
import dev.fritz2.styling.StyleClass
import dev.fritz2.styling.params.BasicParams
import dev.fritz2.styling.params.OverflowValues
import dev.fritz2.styling.params.Style
import dev.fritz2.styling.params.styled
import dev.fritz2.styling.theme.AlertVariants
import dev.fritz2.styling.theme.IconDefinition
import dev.fritz2.styling.theme.Theme
import kotlinx.coroutines.flow.Flow


object Status {
    const val warning = "warning"
    const val info = "info"
    const val success = "success"
    const val error = "error"
}


/**
 *   This class combines the _configuration_ and the core styling of an alert
 *
 *   The alert can be configured for the following aspects :
 *
 *   - title : title of the alert
 *   - description : a description for the alert
 *   - hasCloseButton: alert has a close button or not
 *   - buttonStyling : you can pass some BasicParams to your close button
 *   - variants : subtle | solid | leftAccent | topAccent.
 *   - the alert status : error | success | warning | info
 *   - the icon is rendered depending on the state
 *
 *  This can be done within a functional expression that is the last parameter of the factory function, called
 *  ``build``. It offers an initialized instance of this [AlertComponent] class as receiver, so every mutating
 *  method can be called for configuring the desired state for rendering the alert.
 *
 *  show case : defining alert with status : error
 *
 *  alert {
 *   title { "Status" }
 *   description { "error status" }
 *   status { error }
 *  }
 *
 *  TODO:  variants not implemented yet | icon background color must be adapted @see https://chakra-ui.com/docs/feedback/alert -Status
 *
 *  @see alert
 */


@ComponentMarker
class AlertComponent {


    val alertStyle: Style<BasicParams> = {

        display { flex }
        css(" align-items: center;")
        overflow { OverflowValues.hidden }
        padding { "0.75rem 1rem;" }
        minHeight { "2rem" }
        minWidth { "50%" }
    }

    val titleStyle: Style<BasicParams> = {
        fontWeight { "700" }
        lineHeight { "1.5rem" }
        margins { right { "0.5rem" } }
    }

    val descriptionStyle: Style<BasicParams> = {
        display { inline }
        lineHeight { "1.5rem" }
    }

    var title: (RenderContext.() -> Unit) = {
        (::div.styled({ titleStyle() }) {

        }){ +"Please provide a title" }
    }
    val predefinedButtonStyle: Style<BasicParams> = {
        color { dark }
        focus {
            css("outline: none;")
            boxShadow { none }
        }
    }

    val spanStyle: Style<BasicParams> = {
        flex { shrink { "0" } }
        margins { right { " 0.75rem" } }
        width { "1.25rem" }
        height { " 1.5rem" }
        display { inherit }
    }

    fun title(value: String) {
        title = {
            (::div.styled({ titleStyle() }) {

            }){ +value }
        }
    }

    fun title(value: Flow<String>) {
        title = {
            (::div.styled({ titleStyle() }) {

            }){ value.asText() }
        }
    }

    fun title(value: () -> String) {
        title = {
            (::div.styled() { titleStyle() }){ +value() }
        }
    }

    var description: (RenderContext.() -> Unit) = {
        (::div.styled() { descriptionStyle() }){ +"Please provide a description" }
    }

    fun description(value: String) {
        description = {
            (::div.styled() { descriptionStyle() }){ +value }
        }
    }

    fun description(value: () -> String) {
        description = {
            (::div.styled() {

            }){ +value() }
        }
    }

    fun description(value: Flow<String>) {

        description = {
            (::div.styled() {

            }){ value.asText() }
        }
    }

    var hasCloseButton: Boolean = true
    fun hasCloseButton(value: Boolean) {
        hasCloseButton = value
    }

    fun hasCloseButton(value: () -> Boolean) {
        hasCloseButton = value()
    }

    var status: String = info
    fun status(value: Status.() -> String) {
        status = Status.value()
    }

    var buttonStyling: Style<BasicParams>? = null
    fun buttonStyling(value: () -> Style<BasicParams>) {
        buttonStyling = value()
    }

    var variants: (AlertVariants.() -> Style<BasicParams>) = { Theme().alert.variants.subtle }
    fun variants(value: AlertVariants.() -> Style<BasicParams>) {
        variants = value
    }
}

/**
 *  This component creates an alert
 *
 *  show case : alert without button
 *
 *  alert {
 *      hasCloseButton { false}
 *      title ...
 *      description ...
 *
 *  }
 *
 *  show case : custom close button styling
 *
 *  alert {
 *    title ...
 *    description ...
 *
 *    buttonStyling{
 *         {
 *           background { color { dark }}
 *           css("top: 4px")
 *           css("right: 10px")
 *         }
 *     }
 *  }
 *
 * param styling a lambda expression for declaring the styling as fritz2's styling DSL
 * @param baseClass optional CSS class that should be applied to the element
 * @param id the ID of the element
 * @param prefix the prefix for the generated CSS class resulting in the form ``$prefix-$hash``
 * @param build a lambda expression for setting up the component itself. Details in [AlertComponent]
 *
 * @see AlertComponent
 */
fun RenderContext.alert(
    styling: BasicParams.() -> Unit = {},
    baseClass: StyleClass? = null,
    id: String? = null,
    prefix: String = "alert",
    build: AlertComponent.() -> Unit,
): SimpleHandler<Unit> {
    val component = AlertComponent().apply(build)

    var currentStatus = when (component.status) {
        info -> Theme().alert.status.info
        success -> Theme().alert.status.success
        warning -> Theme().alert.status.warning
        error -> Theme().alert.status.error
        else -> Theme().alert.status.info
    }

    var icon: IconDefinition = when (component.status) {

        info -> Theme().icons.circleInformation
        success -> Theme().icons.circleCheck
        warning -> Theme().icons.circleWarning
        error -> Theme().icons.circleWarning
        else -> Theme().icons.circleInformation
    }

    return modal({
        component.alertStyle()
        component.variants.invoke(Theme().alert.variants)()
        currentStatus()
        styling()
    }, prefix = prefix) {

        hasCloseButton(component.hasCloseButton)
        closeButton({
            component.predefinedButtonStyle.invoke()
            component.buttonStyling?.invoke()
        }) { }

        content {
            (::span.styled() {
                component.spanStyle.invoke()
            }){
                icon({

                }) { fromTheme { icon } }
            }
            component.title.invoke(this)
            component.description.invoke(this)

        }

    }

}
