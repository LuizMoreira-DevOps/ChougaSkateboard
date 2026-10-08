import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
    return (
        <header className={styles.header}>
            <Link
                className={styles.brand}
                href="/"
                aria-label="Chouga Skateboard"
            >
                CHOUGA
            </Link>

            <nav className={styles.nav} aria-label="Navegação principal">
                <Link href="/#loja">Loja</Link>
                <Link href="/#cultura">Cultura</Link>
                <Link href="/#wheels">Wheels</Link>
            </nav>
        </header>
    );
}
