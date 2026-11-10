const passwordInput = document.getElementById("password");

const toggleBtn = document.getElementById("toggleBtn");

const checkBtn = document.getElementById("checkBtn");

const result = document.getElementById("result");


// Show and Hide Password

toggleBtn.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        toggleBtn.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        toggleBtn.textContent = "Show";

    }

});


// Check Password

checkBtn.addEventListener("click", async function () {

    const password = passwordInput.value;

    if (!password) {

        result.textContent = "Please enter a password.";
        result.className = "error";

        return;
    }

    result.textContent = "Checking password... Please wait.";

    result.className = "";

    checkBtn.disabled = true;

    try {

        // Convert password into SHA-1 hash

        const encoder = new TextEncoder();

        const data = encoder.encode(password);

        const hashBuffer = await crypto.subtle.digest("SHA-1", data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        const hash = hashArray
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();


        // Split hash into first 5 characters and remaining characters

        const prefix = hash.substring(0, 5);

        const suffix = hash.substring(5);


        // Send request to HIBP API

        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${prefix}`,
            {
                headers: {
                    "Add-Padding": "true"
                }
            }
        );

        if (!response.ok) {

            throw new Error("API request failed.");

        }


        const responseData = await response.text();


        // Search for matching hash suffix

        const hashes = responseData.split("\n");

        let foundCount = 0;

        for (let item of hashes) {

            const [hashSuffix, count] = item.trim().split(":");

            if (hashSuffix === suffix) {

                foundCount = parseInt(count, 10);

                break;

            }

        }


        // Display result

        if (foundCount > 0) {

            result.innerHTML =
                `⚠️ Password Found!<br>
                This password appeared ${foundCount.toLocaleString()} times in known data breaches.`;

            result.className = "danger";

        } else {

            result.textContent =
                "✓ Good News! This password was not found in the HIBP dataset.";

            result.className = "safe";

        }

    } catch (error) {

        result.textContent =
            "Something went wrong. Please check your internet connection and try again.";

        result.className = "error";

        console.error(error);

    } finally {

        checkBtn.disabled = false;

    }

});
