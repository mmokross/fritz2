package dev.fritz2.lenses

import com.google.devtools.ksp.*
import com.google.devtools.ksp.processing.CodeGenerator
import com.google.devtools.ksp.processing.KSPLogger
import com.google.devtools.ksp.processing.Resolver
import com.google.devtools.ksp.processing.SymbolProcessor
import com.google.devtools.ksp.symbol.*
import com.squareup.kotlinpoet.*
import com.squareup.kotlinpoet.ParameterizedTypeName.Companion.parameterizedBy
import com.squareup.kotlinpoet.ksp.*

class LensesProcessor(
    private val codeGenerator: CodeGenerator,
    private val logger: KSPLogger
) : SymbolProcessor {

    override fun process(resolver: Resolver): List<KSAnnotated> {
        val lensesAnnotated = resolver.getSymbolsWithAnnotation(Lenses::class.qualifiedName!!)
        val unableToProcess = lensesAnnotated.filterNot { it.validate() }

        lensesAnnotated.filter { it is KSClassDeclaration && it.validate() }
            .forEach { it.accept(LensesVisitor(), Unit) }

        return unableToProcess.toList()
    }

    private inner class LensesVisitor : KSVisitorVoid() {

        @OptIn(KotlinPoetKspPreview::class)
        override fun visitClassDeclaration(classDeclaration: KSClassDeclaration, data: Unit) {
            val packageName = classDeclaration.packageName.asString()

            if (classDeclaration.isDataClass()) {
                val compObj = classDeclaration.declarations
                    .filterIsInstance<KSClassDeclaration>()
                    .filter { it.isCompanionObject }
                    .firstOrNull()

                if (compObj != null) {
                    val lensableProps = determineLensableProperties(classDeclaration)
                    assertLensesPropertyNamesAreAvailable(compObj, lensableProps, classDeclaration)
                    if (lensableProps.isNotEmpty()) {
                        val fileSpec = FileSpec.builder(
                            packageName = packageName,
                            fileName = classDeclaration.simpleName.asString() + "Lenses"
                        ).apply {
                            addComment("GENERATED by fritz2 - NEVER CHANGE CONTENT MANUALLY!")
                            lensableProps.forEach { prop ->
                                val attributeName = prop.simpleName.getShortName()
                                val isGeneric = prop.type.resolve().declaration is KSTypeParameter
                                addFunction(
                                    FunSpec.builder(
                                        prop.simpleName.getShortName()
                                    ).returns(
                                        Lens::class.asClassName().parameterizedBy(
                                            if (isGeneric) classDeclaration.toClassName()
                                                .parameterizedBy(classDeclaration.typeParameters.map { it.toTypeVariableName() })
                                            else classDeclaration.toClassName(),
                                            prop.type.toTypeName(classDeclaration.typeParameters.toTypeParameterResolver())
                                        )
                                    ).addTypeVariables(classDeclaration.typeParameters.map { it.toTypeVariableName() })
                                        .receiver(compObj.asType(emptyList()).toTypeName())
                                        .addCode(
                                            """ |return buildLens(
                                            |  %S, 
                                            |  { it.$attributeName }, 
                                            |  { p, v -> p.copy($attributeName = v)}
                                            |)
                                        """.trimMargin(),
                                            attributeName
                                        ).build()
                                )
                            }
                        }.build()

                        fileSpec.writeTo(codeGenerator = codeGenerator, aggregating = false)
                    } else {
                        logger.warn(
                            "@Lenses annotated data class $classDeclaration found, but it has no public"
                                    + " properties defined in constructor -> can not create any lenses though..."
                        )
                    }
                } else {
                    logger.error(
                        "The companion object for data class $classDeclaration is missing!"
                                + " Please define it to bypass this error."
                    )
                }
            } else {
                logger.error("$classDeclaration is not a data class!")
            }
        }
    }

    private fun determineLensableProperties(classDeclaration: KSClassDeclaration): List<KSPropertyDeclaration> {
        val allPublicCtorProps = classDeclaration.primaryConstructor!!.parameters.filter { it.isVal }.map { it.name }
        return classDeclaration.getDeclaredProperties()
            .filter { it.isPublic() && allPublicCtorProps.contains(it.simpleName) }.toList()
    }

    private fun assertLensesPropertyNamesAreAvailable(
        compObj: KSClassDeclaration,
        lensableProps: List<KSPropertyDeclaration>,
        classDeclaration: KSClassDeclaration
    ) {
        val neededFunNamesAlreadyInUse = compObj.getDeclaredFunctions()
            .filter { declaredFunctions ->
                lensableProps.any {
                    it.simpleName.getShortName() == declaredFunctions.simpleName.getShortName()
                }
            }
            .toList()

        if (neededFunNamesAlreadyInUse.isNotEmpty()) {
            logger.error(
                "The companion object of $classDeclaration already defines the following function(s): "
                        + neededFunNamesAlreadyInUse.joinToString("; ")
                        + " -> Those names must not be defined! They are used for the automatic lenses generation. "
                        + "Please rename those existing function(s) to bypass this problem!"
            )
        }
    }

    private fun KSClassDeclaration.isDataClass() =
        modifiers.contains(Modifier.DATA)
}