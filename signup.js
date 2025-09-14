import { auth, db } from './scheduler-firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");
const signupBtn = document.getElementById("signupBtn");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevents the page from reloading.

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("signupMsg");

    // Get selected role from radio buttons
    const roleElements = document.getElementsByName("role");
    let selectedRole = "";
    for (const elem of roleElements) {
        if (elem.checked) {
            selectedRole = elem.value;
            break;
        }
    }

    // Basic validation
    if (!name || !email || !password || !selectedRole) {
        message.style.color = "red";
        message.innerText = "Please fill in all fields.";
        return;
    }

    try {
        // 1. Create a Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Send email verification
        await sendEmailVerification(user);

        // Log to confirm we've reached this part of the code
        console.log("Attempting Firestore write for UID:", user.uid);

        // 3. Save user profile + role to Firestore
        const uid = user.uid;
        await setDoc(doc(db, "users", uid), {
            name: name,
            email: email,
            role: selectedRole,
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        
        // Log to confirm the write operation succeeded
        console.log("Firestore write completed successfully. ✅");

        message.style.color = "green";
        message.innerText = `Account created successfully! A verification email has been sent to ${email}. Please verify your email before logging in.`;

        // Optional: Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2500);

    } catch (error) {
        console.error("Signup Error:", error);
        message.style.color = "red";
        message.innerText = error.message;
    }
});
