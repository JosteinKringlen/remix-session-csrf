# remix-session-csrf

The CSRF helper from v6 of [remix-utils](https://github.com/sergiodxa/remix-utils/tree/main) published as a standalone package for Node.

## Installation

```bash
npm install remix-session-csrf
```

## Usage

Set up a session store:

```ts
// app/utils/session.server.ts

import { createCookieSessionStorage } from '@remix-run/node';

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: '__session', // use any name you want here
        sameSite: 'lax', 
        path: '/',
        httpOnly: true, // for security reasons, make this cookie http only
        secrets: ['s3cr3t'], // replace this with an actual secret from env variable
        secure: process.env.NODE_ENV === 'production', // enable this in prod only
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
```

Configure your `root.tsx` to generate a csrf token, and pass it to the client.

```tsx
// app/root.tsx

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { AuthenticityTokenProvider } from 'remix-session-csrf/react';
import { verifyAuthenticityToken } from 'remix-session-csrf/server';
import {
    // rest of imports
    useLoaderData,
} from '@remix-run/react';

import { commitSession, getSession } from '~/utils/session.server';

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get('cookie'));
    const csrfToken = createAuthenticityToken(session);

    return json({
        csrfToken,
    }, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    })
}

export default function App() {
    const { csrfToken } = await useLoaderData<typeof loader>();

    return (
        <AuthenticityTokenProvider token={csrfToken}>
            {/* App markup */}
        </AuthenticityTokenProvider>
    )
}
```

Then, add a token and validation to your form + action:

```tsx
// app/routes/some-route.tsx

import { type ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-session-csrf/react';
import { verifyAuthenticityToken } from 'remix-session-csrf/server';

import { getSession } from '~/utils/session.server';

export async function action({ request }: ActionFunctionArgs)  {
    const session = await getSession(request.headers.get('Cookie'));
    await verifyAuthenticityToken(request, session);

    return {}
}

export default function Component() {
    return (
        <Form method="POST">
            <AuthenticityTokenInput />
            <input type="text" name="name">
            <button type="submit">Submit</button>
        </Form>
    )
}
```

You can also use the `useAuthenticityToken` hook to get the token and validation function:

```tsx
// app/routes/some-route.tsx

import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useAuthenticityToken } from 'remix-session-csrf/react';
import { verifyAuthenticityToken } from 'remix-session-csrf/server';

import { getSession } from '~/utils/session.server';

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get('Cookie'));
    await verifyAuthenticityToken(request, session);

    return null;
}

export default function Component() {
    const fetcher = useFetcher();
    const csrf = useAuthenticityToken();

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    fetcher.submit({ csrf, name: 'Steve' }, { method: 'POST' });
                }}
            >
                Submit
            </button>
        </div>
    );
}
```
