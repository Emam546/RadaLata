import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta charSet="UTF-8" />
                <link
                    rel="icon"
                    type="image/svg+xml"
                    href="/vite.svg"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                {/* <!-- FONTS --> */}
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Fira+Mono&display=optional"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
