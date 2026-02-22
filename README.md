
# Dynamic Image API

Welcome to the Dynamic Image API, a powerful and flexible service for fetching animal images on demand. This API also includes a sample endpoint for managing user data.

## Base URL

All API endpoints are relative to the following base URL. Please replace `https://img-server-theta.vercel.app/` with the live URL of your Vercel deployment.

```
https://img-server-theta.vercel.app/
```

-----

## Getting Started (Local Setup)

If you wish to run a local instance of this server, please follow the steps below.

### Prerequisites

  * Node.js (v18 or higher)
  * npm (Node Package Manager)
  * A Pexels API Key (available for free from [pexels.com/api](https://www.pexels.com/api/))

### Installation & Configuration

1.  **Clone the repository:**

    ```bash
    git clone Dynamic-Image-Server
    cd Dynamic-Image-Server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the root of the project and add your Pexels API key.

    ```env
    PEXELS_API_KEY="goT7jSJYxYoqXLfc0i66CmfxqZ1ty8IeSGEl4qYVvZhDV3NjJT2Ny8ro"
    ```

    *Note: For this to work, you would need to update `routes/animal.js` to use `process.env.PEXELS_API_KEY` instead of the hardcoded key.*

4.  **Run the server:**

    ```bash
    node man.js
    ```

    The server will be running at `http://localhost:3000`.

-----

## API Endpoints

### Generic Image

Takes any free-text query and redirects to the best matching image found on Wikimedia Commons.

  * **Endpoint:** `GET /img?text=<your text>`
  * **Example:** `GET /img?text=Honda%20Activa%204G`
  * **Success Response:** `302 Found` redirect to an image URL
  * **JSON mode:** add `?format=json` (and `&debug=1` to see top candidates)
  * **If local network blocks HTTPS:** set `NODE_EXTRA_CA_CERTS` to your proxy CA cert. For local-only testing you can set `IMG_ALLOW_INSECURE_TLS=1` (not recommended for production).

### Animal API

The core feature of this service. It provides a simple way to get images of animals.

#### Get Animal Image

Redirects to an image URL of the specified animal. The service first checks a local cache; if a match isn't found, it fetches an image from the Pexels API.

  * **Endpoint:** `GET /api/animal/:name`

  * **Description:** The `:name` parameter should be the name of an animal (e.g., `tiger`, `dog`, `cat`).

  * **Success Response:**

      * **Code:** `302 Found`
      * **Content:** The request is redirected to the direct URL of the image.

  * **Error Response:**

      * **Code:** `404 Not Found`
      * **Content:** `No image found for this`

  * **Example Usage (HTML):**

    ```html
    <img src="https://img-server-theta.vercel.app/api/animal/lion" alt="Image of a Lion">
    ```
    ![https://img-server-theta.vercel.app/](https://img-server-theta.vercel.app/api/animal/lion)

### Users API

A sample API for managing mock user data.

#### Get All Users

Retrieves a list of all sample users.

  * **Endpoint:** `GET /api/users`
  * **Success Response:**
      * **Code:** `200 OK`
      * **Content:**
        ```json
        [
            { "id": 1, "name": "Alice" },
            { "id": 2, "name": "Bob" }
        ]
        ```

#### Get User by ID

Retrieves a single user by their unique ID.

  * **Endpoint:** `GET /api/users/:id`
  * **Success Response:**
      * **Code:** `200 OK`
      * **Content:**
        ```json
        { "id": 1, "name": "Alice" }
        ```
  * **Error Response:**
      * **Code:** `404 Not Found`
      * **Content:** `{ "message": "User not found" }`

#### Create a New User

Simulates the creation of a new user.

  * **Endpoint:** `POST /api/users`
  * **Request Body:**
    ```json
    {
        "name": "Charlie"
    }
    ```
  * **Success Response:**
      * **Code:** `201 Created`
      * **Content:**
        ```json
        {
            "message": "User created",
            "user": {
                "name": "Charlie"
            }
        }
        ```
