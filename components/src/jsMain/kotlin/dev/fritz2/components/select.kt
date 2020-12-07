import dev.fritz2.binding.Store
import dev.fritz2.components.ComponentMarker
import dev.fritz2.components.icon
import dev.fritz2.components.optionSelect
import dev.fritz2.dom.html.Events.select
import dev.fritz2.dom.html.Option
import dev.fritz2.dom.html.RenderContext
import dev.fritz2.dom.html.Select
import dev.fritz2.dom.selectedValue
import dev.fritz2.styling.StyleClass
import dev.fritz2.styling.StyleClass.Companion.plus
import dev.fritz2.styling.params.BasicParams
import dev.fritz2.styling.params.Style
import dev.fritz2.styling.params.styled
import dev.fritz2.styling.staticStyle
import dev.fritz2.styling.theme.IconDefinition
import dev.fritz2.styling.theme.SelectSize
import dev.fritz2.styling.theme.SelectVariants
import dev.fritz2.styling.theme.Theme
import kotlinx.coroutines.flow.*

/**
 * This class offers configuration for a select element
 *
 * The select component can be configured as follows:
 *  - the size of the element
 *  - a placeholder
 *  - the icon of the select
 *  - some predefined styling variants
 *
 *  This can be done within a functional expression that is the last parameter of the factory function, called
 *  ``init``. It offers an initialized instance of this [SelectComponent] class as receiver, so every mutating
 *  method can be called for configuring the desired state for rendering the select.
 *
 *  * For a detailed explanation and examples of usage have a look at the [select] function
 */
@ComponentMarker
class SelectComponent<T> {


    companion object {
        val staticCss = staticStyle(
            "selectContainer",
            """
                  width: 50%;
                  height: fit-content;
                  position: relative;
                  outline:none;
                  appearance:none;
              """
        )
    }

    val basicInputStyles: Style<BasicParams> = {

        width { full }
        paddings { bottom { "1px" } }
        lineHeight { normal }
        fontSize { "1rem" }
        paddings {
            left { "1rem" }
            right { "2rem" }
        }
        height { "2.5rem" }

        radius { "0.375rem" }
        focus {

            border {
                color { "#3182ce" }
            }
            boxShadow { outline }

        }
        position { relative { } }
        css("outline: 0px;")
        css("appearance: none;")
        css("transition: all 0.2s ease 0s;")

    }
    val iconWrapperStyle: Style<BasicParams> = {
        fontSize { "1.25rem" }

        position { absolute { } }
        display { inlineFlex }
        width { "1.5rem" }
        height { full }
        css("-webkit-box-align: center;")
        css("align-items: center;")
        css("-webkit-box-pack: center;")
        css("justify-content: center;")
        css("right: 0.5rem;")
        css("pointer-events: none;")
        css("top: 50%;")
        css("transform: translateY(-50%);")

    }

    var placeholder: Flow<T>? = null

    fun placeholder(value: T) {
        placeholder = flowOf(value)
    }

    fun placeholder(value: Flow<T>) {
        placeholder = value
    }

    fun placeholder(value: () -> Flow<T>) {
        placeholder = value()

    }

    var options: Flow<List<T>> = flowOf(emptyList())

    fun options(value: List<T>) {
        options = flowOf(value)
    }

    fun options(value: () -> Flow<List<T>>) {
        options = value()
    }

    var variant: SelectVariants.() -> Style<BasicParams> = { Theme().select.variant.outline }

    fun variant(value: SelectVariants.() -> Style<BasicParams>) {
        variant = value
    }

    var size: SelectSize.() -> Style<BasicParams> = { Theme().select.size.normal }

    fun size(value: SelectSize.() -> Style<BasicParams>) {
        size = value
    }


    var icon: IconDefinition = Theme().icons.chevronDown
    fun icon(value: () -> IconDefinition) {
        icon = value()
    }

    var label: ((item: T) -> String) = { it.toString() }
    fun label(value: (item: T) -> String) {
        label = value
    }


    var value: ((item: T) -> String) = { it.toString() }
    fun value(param: (item: T) -> String) {
        value = param
    }


    fun renderPlaceHolderAndOptions(renderContext: Select, store: Store<T>): Map<String, T> {
        val map = mutableMapOf<String, T>()
        renderContext.apply {

            placeholder!!.combine(options) { placholder, options ->
                listOf(placholder) + options
            }.renderEach { item ->
                handleRendering(map, item, store, this, this@SelectComponent)
            }
        }

        return map
    }

    fun renderOptions(renderContext: Select, store: Store<T>): Map<String, T> {
        val map = mutableMapOf<String, T>()

        renderContext.apply {

            options.renderEach { item ->
                handleRendering(map, item, store, this, this@SelectComponent)
            }
        }


        return map
    }

    private fun handleRendering(
        map: MutableMap<String, T>,
        item: T,
        store: Store<T>,
        renderContext: RenderContext,
        selectComponent: SelectComponent<T>,
    ): Option {

        map[item.toString()] = item
        val selected = store.data.map { it == item }

        return renderContext.optionSelect {
            value { selectComponent.value(item) }
            label { selectComponent.label(item) }
            selected(selected)
        }
    }

}


/**
 * This component generates a select element
 *
 * You have to pass a store in order to set the selected value
 *
 * // basic usecase would be :
 *    val myOptions = listOf("black", "red", "yellow")
 *    val selectedItem = storeOf("")
 *
 *    select (store = selectedItem) {
 *
 *    placeholder("My Placeholder")
 *    options(myOptions)
 *
 *    }
 *
 *  // use case showing how to set an other icon
 *
 *    select(store = selectedItem) {
 *    placeholder("circle-add icon")
 *    icon { Theme().icons.circleAdd } // icon_name = circleAdd
 *
 *    }
 *
 *  // use case showing variant and size handling
 *
 *    select(store = selectedItem) {
 *    size { large }
 *    variant { outline }
 *
 *    }
 *
 */
fun <T> RenderContext.select(
    styling: BasicParams.() -> Unit = {},
    store: Store<T>,
    baseClass: StyleClass? = null,
    id: String? = null,
    prefix: String = "select",
    init: SelectComponent<T>.() -> Unit,
) {
    val component = SelectComponent<T>().apply(init)


    (::div.styled(styling, baseClass + SelectComponent.staticCss, id, prefix) {


    }){
        (::select.styled(styling, baseClass) {
            component.basicInputStyles()
            component.variant.invoke(Theme().select.variant)()
            component.size.invoke(Theme().select.size)()
        }){

            val map = when (component.placeholder) {
                null -> component.renderOptions(this, store)
                else -> component.renderPlaceHolderAndOptions(this, store)
            }


            changes.selectedValue()
                .map { map[it] ?: error("something in select component went wrong") } handledBy store.update

        }
        (::div.styled(prefix = "icon-wrapper") {
            component.iconWrapperStyle()
        }){
            icon { fromTheme { component.icon } }
        }


    }

}

