import { Suspense } from "react";
import type { Metadata } from "next";

import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { ProductDetails } from "../../components/ProductDetails/ProductDetails";

export const metadata: Metadata = {
    title: "Produto",
    description: "Conheça os produtos da Chouga Skateboard.",
};

export default function ProductPage() {
    return (
        <>
            <Header />

            <main>
                <Suspense
                    fallback={
                        <p role="status" style={{ padding: "4rem 8%" }}>
                            Carregando produto...
                        </p>
                    }
                >
                    <ProductDetails />
                </Suspense>
            </main>

            <Footer />
        </>
    );
}
