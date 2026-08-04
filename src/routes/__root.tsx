import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: APP_TAGLINE },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootDocument,
  errorComponent: RootError,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

function RootError({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong</title>
        <link rel="stylesheet" href={appCss} />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f6f5f2",
          color: "#14141a",
          padding: 32,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: "40px auto",
            background: "#fff",
            border: "1px solid #e2e0d8",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: "#5c5c68", margin: "0 0 16px" }}>
            The page hit an unexpected error. Reload to continue.
          </p>
          <pre
            style={{
              fontSize: 11,
              background: "#eeede8",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {error?.message ?? String(error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.assign("/")}
            style={{
              marginTop: 16,
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              background: "#1a1a24",
              color: "#f6f5f2",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
