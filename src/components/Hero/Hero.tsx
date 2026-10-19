import Image from "next/image";
import styles from "./Hero.module.css";
import heroImage from "./assets/hero-chouga.webp";

export function Hero() {
    return (
        <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroMedia} aria-hidden="true">
                <Image
                    src={heroImage}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1440px"
                    className={styles.heroImage}
                />
            </div>

            <div className={styles.heroOverlay} aria-hidden="true" />

            <div className={styles.heroContent}>
                <p className={styles.heroEyebrow}>
                    <span className={styles.heroDot} />
                    CHOUGA SKATEBOARD / CURITIBA, BR
                </p>

                <h1 id="hero-title" className={styles.heroTitle}>
                    A RUA
                    <br />
                    NÃO PEDE
                    <br />
                    <span>LICENÇA.</span>
                </h1>

                <p className={styles.heroTagline}>
                    Skate no sangue.
                    <br />
                    Sempre no pé.
                </p>

                <a className={styles.heroCta} href="#loja">
                    EXPLORAR COLEÇÃO
                    <span aria-hidden="true">↗</span>
                </a>
            </div>

            <div className={styles.heroBottom}>
                <span>STREETWEAR NÃO SE VESTE. SE VIVE.</span>
                <span>SKATE / STREET / CULTURA</span>
            </div>

            <span className={styles.heroIndex} aria-hidden="true">
                01 / CHOUGA
            </span>
        </section>
    );
}
