import styles from "./Hero.module.css";

export function Hero() {
    return (
        <section className={styles.hero}>
            <p className={styles.eyebrow}>Skate · Streetwear · Cultura</p>

            <h1>Chouga Skateboard</h1>

            <p className={styles.tagline}>
                Loja limpa. Conteúdo sujo. Engenharia limpa.
            </p>
        </section>
    );
}
