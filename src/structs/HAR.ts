interface HAR {
    log: Log;
}

interface Log {
    version: string;
    entries: Entry[];
}

interface Entry {
    request: Requests;
}

interface Requests {
    bodySize: number;
    cookies: Cookie[];
    headers: Header[];
    headersSize: number;
    httpVersion: string;
    method: string;
    postData?: PostData;
    queryString: Header[];
    url: string;
}

interface Header {
    name: string;
    value: string;
}

interface PostData {
    mimeType: string;
    params?: Param[];
    text?: string;
}

interface Param {
    name: string;
    value: string;
}

interface Cookie {
    name: string;
    value: string;
}