import styles from "./Hero.module.css";

export function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <p className={styles.heroEyebrow}>
                    Skate · Streetwear · Cultura
                </p>

                <h1 className={styles.heroTitle}>
                    Chouga
                    <span>Skateboard</span>
                </h1>

                <p className={styles.heroTagline}>
                    Loja limpa. Conteúdo sujo. Engenharia limpa.
                </p>

                <div className={styles.heroMeta}>
                    <span>Commerce + Culture</span>
                    <span>Chouga 2.0</span>
                </div>
            </div>

            <p className={styles.heroIndex} aria-hidden="true">
                01
            </p>
        </section>
    );
}
