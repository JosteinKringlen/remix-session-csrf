import { json, type Session } from '@remix-run/node';
import { v4 as uuid } from 'uuid';

/**
 * Create a random string in Base64 to be used as an authenticity token for
 * CSRF protection. You should run this on the `root.tsx` loader only.
 * @example
 * const token = createAuthenticityToken(session); // create and set in session
 * return json({ ...otherData, csrf: token }); // return the token in the data
 * @example
 * // create and set in session with the key `csrf-token`
 * const token = createAuthenticityToken(session, "csrfToken");
 * return json({ ...otherData, csrf: token }); // return the token in the data
 */
export function createAuthenticityToken(session: Session, sessionKey = 'csrf') {
    const token = session.get(sessionKey);
    if (typeof token === 'string') {
        return token;
    }
    const newToken = uuid();
    session.set(sessionKey, newToken);
    return newToken;
}

/**
 * Verify if a request and session has a valid CSRF token.
 * @example
 * export async function action({ request }: ActionArgs) {
 *   const session = await getSession(request.headers.get("Cookie"));
 *   await verifyAuthenticityToken(request, session);
 *   // the request is authenticated and you can do anything here
 * }
 * @example
 * export async function action({ request }: ActionArgs) {
 *   const session = await getSession(request.headers.get("Cookie"));
 *   await verifyAuthenticityToken(request, session, "csrfToken");
 *   // the request is authenticated and you can do anything here
 * }
 * @example
 * export async function action({ request }: ActionArgs) {
 *   const session = await getSession(request.headers.get("Cookie"));
 *   const formData = await unstable_parseMultipartFormData(request, uploadHandler);
 *   await verifyAuthenticityToken(formData, session);
 *   // the request is authenticated and you can do anything here
 * }
 */
export async function verifyAuthenticityToken(
    data: Request | FormData,
    session: Session,
    sessionKey = 'csrf',
) {
    if (data instanceof Request && data.bodyUsed) {
        throw new Error(
            'The body of the request was read before calling verifyAuthenticityToken. Ensure you clone it before reading it.',
        );
    }
    // We clone the request to ensure we don't modify the original request.
    // This allow us to parse the body of the request and const the original request
    // still be used and parsed without errors.
    const formData =
        data instanceof FormData ? data : await data.clone().formData();

    // if the session doesn't have a csrf token, throw an error
    if (!session.has(sessionKey)) {
        throw json(
            { message: "Can't find CSRF token in session." },
            { status: 422 },
        );
    }

    // if the body doesn't have a csrf token, throw an error
    if (!formData.get(sessionKey)) {
        throw json(
            { message: "Can't find CSRF token in body." },
            { status: 422 },
        );
    }

    // if the body csrf token doesn't match the session csrf token, throw an
    // error
    if (formData.get(sessionKey) !== session.get(sessionKey)) {
        throw json(
            { message: "Can't verify CSRF token authenticity." },
            { status: 422 },
        );
    }
}
