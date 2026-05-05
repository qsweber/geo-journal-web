# Authenticated API Calls

This guide explains how to make authenticated API calls from your Next.js frontend to your backend API using AWS Cognito authentication.

## Setup

### 1. Environment Configuration

Add your API URL to your `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://0deoyki5fg.execute-api.us-west-2.amazonaws.com/dev
```

See `.env.local.example` for the complete configuration template.

### 2. How It Works

When a user authenticates with Cognito, they receive:

- **ID Token**: Contains user identity claims (email, sub, etc.) - this is what you typically send to your backend
- **Access Token**: Used for authorizing access to resources

The API client automatically:

1. Retrieves the user's ID token from the auth context
2. Adds it to the `Authorization` header as a Bearer token
3. Makes the HTTP request to your backend

Your backend API Gateway should be configured to validate the JWT token against your Cognito User Pool.

## Usage

### Basic Usage with the Hook

The simplest way to make authenticated API calls is using the `useApiClient` hook:

```tsx
"use client";

import { useState } from "react";
import { useApiClient } from "@/lib/api/useApiClient";

export default function MyComponent() {
  const apiClient = useApiClient();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await apiClient.get("/foo");
      setData(response);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Available Methods

The API client supports all HTTP methods:

```tsx
// GET request
const data = await apiClient.get("/endpoint");

// POST request
const result = await apiClient.post("/endpoint", {
  key: "value",
});

// PUT request
const updated = await apiClient.put("/endpoint/123", {
  key: "new value",
});

// PATCH request
const patched = await apiClient.patch("/endpoint/123", {
  field: "updated",
});

// DELETE request
await apiClient.delete("/endpoint/123");
```

### TypeScript Support

You can specify response types:

```tsx
interface UserData {
  id: string;
  name: string;
  email: string;
}

const userData = await apiClient.get<UserData>("/user/profile");
// userData is typed as UserData
```

### Error Handling

The API client throws errors for:

- User not authenticated (no ID token available)
- Network failures
- Non-2xx HTTP responses

```tsx
try {
  const response = await apiClient.get("/endpoint");
  console.log("Success:", response);
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);

    // Handle specific errors
    if (error.message.includes("not authenticated")) {
      // Redirect to login
      router.push("/login");
    } else if (error.message.includes("403")) {
      // User doesn't have permission
      alert("You don't have permission to access this resource");
    }
  }
}
```

### Using the API Client Directly

For more control, you can instantiate the API client directly:

```tsx
import { ApiClient } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/useAuth";

const { getIdToken } = useAuth();

const apiClient = new ApiClient({
  baseUrl: "https://api.example.com",
  getIdToken,
});

const response = await apiClient.get("/custom-endpoint");
```

### Server-Side Usage (Advanced)

For server-side API calls (in API routes or server components), you'll need to pass the token from the client:

```tsx
// Client component
"use client";

export default function ClientComponent() {
  const { getIdToken } = useAuth();

  const handleAction = async () => {
    const idToken = getIdToken();

    const response = await fetch("/api/server-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    console.log(data);
  };

  return <button onClick={handleAction}>Do Server Action</button>;
}
```

```tsx
// app/api/server-action/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  // Make authenticated request to your backend
  const response = await fetch(
    "https://0deoyki5fg.execute-api.us-west-2.amazonaws.com/dev/foo",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

## Backend Configuration

Your AWS API Gateway should be configured to validate the JWT token from Cognito. Here's what the backend receives:

### Request Headers

```
Authorization: Bearer eyJraWQiOiJ....(ID Token JWT)
```

### Validating the Token

Your backend should:

1. Extract the token from the Authorization header
2. Verify the JWT signature using Cognito's public keys
3. Verify the token's claims:
   - `iss` (issuer) should be `https://cognito-idp.{region}.amazonaws.com/{userPoolId}`
   - `token_use` should be `id`
   - `aud` (audience) should match your app client ID
   - `exp` (expiration) should be in the future

### Example Token Payload

```json
{
  "sub": "a1b2c3d4-5678-90ab-cdef-EXAMPLE11111",
  "email_verified": true,
  "iss": "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_EXAMPLE",
  "cognito:username": "user@example.com",
  "aud": "1example23456789",
  "token_use": "id",
  "auth_time": 1609876543,
  "exp": 1609880143,
  "iat": 1609876543,
  "email": "user@example.com"
}
```

### API Gateway Authorizer

If using AWS API Gateway, you can configure a Cognito Authorizer:

1. In API Gateway, create a new Authorizer
2. Select "Cognito" as the type
3. Choose your User Pool
4. Set Token Source as `Authorization`
5. Attach the authorizer to your API methods

The authorizer will automatically validate tokens and make user claims available to your Lambda functions in the request context.

## Example: See It In Action

Check out the [Protected Page](<../app/(main)/protected/page.tsx>) for a complete working example of making authenticated API calls.

## Troubleshooting

### "User is not authenticated" error

- Make sure the user is logged in
- Check that the session hasn't expired
- Verify the auth context is properly set up

### CORS errors

- Configure CORS on your API Gateway to allow requests from your domain
- Include the Authorization header in the allowed headers

### 401 Unauthorized

- Verify your backend is properly validating the token
- Check that the User Pool ID and Client ID match between frontend and backend
- Ensure the token hasn't expired (tokens are valid for 1 hour by default)

### Token missing claims

- Verify you're sending the ID token, not the access token
- Check your Cognito User Pool attribute settings
