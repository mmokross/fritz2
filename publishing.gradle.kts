// publishing

apply(plugin = "maven-publish")
apply(plugin = "signing")
apply(plugin = "org.jetbrains.dokka")

// Workaround for Gradle issue
// https://github.com/gradle/gradle/issues/26091
tasks.withType<AbstractPublishToMaven>().configureEach {
    dependsOn(tasks.withType<Sign>())
}

// Generates a javadoc jar from dokka html sources
val javadocJar by tasks.creating(Jar::class) {
    group = JavaBasePlugin.DOCUMENTATION_GROUP
    description = "Assembles java doc to jar"
    archiveClassifier.set("javadoc")
    from(tasks.named("dokkaHtml"))
}

the<SigningExtension>().apply {
    val signingKey: String = System.getenv("GPG_SIGNING_KEY").orEmpty()
    val signingPassphrase: String = System.getenv("GPG_SIGNING_PASSPHRASE").orEmpty()

    if (signingKey.isNotBlank() && signingPassphrase.isNotBlank()) {
        useInMemoryPgpKeys(signingKey, signingPassphrase)
        sign(the<PublishingExtension>().publications)
    }
}

the<PublishingExtension>().apply {
    repositories {
        maven {
            name = "sonatype"

            val releaseUrl = "https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/"
            val snapshotUrl = "https://s01.oss.sonatype.org/content/repositories/snapshots/"
            val isRelease = System.getenv("GITHUB_EVENT_NAME").equals("release", true)

            url = uri(if (isRelease && !version.toString().endsWith("SNAPSHOT")) releaseUrl else snapshotUrl)
            // for local testing
            // url = uri(layout.buildDirectory.dir("repo"))

            credentials {
                username = System.getenv("OSSRH_USERNAME")
                password = System.getenv("OSSRH_PASSWORD")
            }
        }
    }

    publications.withType(MavenPublication::class) {
        // javadoc jar is mandatory for publishing to MavenCentral
        artifact(javadocJar)
        pom {
            name.set("fritz2")
            description.set("Easily build reactive web-apps in Kotlin based on flows and coroutines")
            url.set("https://www.fritz2.dev/")

            scm {
                connection.set("scm:git:https://github.com/jwstegemann/fritz2/")
                developerConnection.set("scm:git:https://github.com/jwstegemann/")
                url.set("https://github.com/jwstegemann/fritz2/")
            }

            licenses {
                license {
                    name.set("MIT")
                    url.set("https://opensource.org/licenses/MIT")
                }
            }

            developers {
                developer {
                    id.set("jwstegemann")
                    name.set("Jens Stegemann")
                    email.set("jwstegemann@gmail.com")
                }
                developer {
                    id.set("jamowei")
                    name.set("Jan Weidenhaupt")
                    email.set("jan@rexster.de")
                }
            }
        }
    }
}