// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl2-fTBzBsUQ2jqMMNew5aRLOpwZF3huE",
  authDomain: "fir-wb-bb786.firebaseapp.com",
  projectId: "fir-wb-bb786",
  storageBucket: "fir-wb-bb786.appspot.com",
  messagingSenderId: "191015246809",
  appId: "1:191015246809:web:25c044c896fd4c6f3a97c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log(app);

const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// DOM elements
const myModals = document.querySelectorAll('.modal');

// Signup Function
async function signup(event) {
  event.preventDefault();
  const emailField = document.getElementById('SignupEmail');
  const passwordField = document.getElementById('SignupPassword');
  const email = emailField.value.trim();
  const password = passwordField.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User signed up:', user);

    // Save user data to Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date()
    });

    M.toast({ html: `Welcome ${user.email}`, classes: "teal" });
    emailField.value = "";
    passwordField.value = "";
    M.Modal.getInstance(myModals[0]).close();
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

function haveAccount(event) {
  event.preventDefault();
  M.Modal.getInstance(myModals[0]).close();
}

// Attach event listener to button
document.getElementById('signupButton')?.addEventListener('click', signup);
document.getElementById('alreadySignup')?.addEventListener('click', haveAccount);

// Signin Function
async function signin(event) {
  event.preventDefault();
  const emailField = document.getElementById('LoginEmail');
  const passwordField = document.getElementById('LoginPassword');
  const email = emailField.value.trim();
  const password = passwordField.value;

  if (email === '' || password === '') {
    M.toast({ html: 'Please fill out both email and password fields.', classes: "red" });
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Signed in successfully:', user);

    emailField.value = "";
    passwordField.value = "";
    M.Modal.getInstance(myModals[1]).close();

    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 1000);
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

document.getElementById('loginButton')?.addEventListener('click', signin);

// Logout Function
async function logout() {
  try {
    await signOut(auth);
    console.log("Sign-out successful.");
    M.toast({ html: "Sign-out successful.", classes: "teal" });

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

document.getElementById('signoutButton')?.addEventListener('click', logout);

// Google Login Function
async function loginGoogle(event) {
  event.preventDefault();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user data to Firestore if new
    const usersCollection = collection(db, "users");
    await addDoc(usersCollection, {
      uid: user.uid,
      email: user.email,
      provider: "Google",
      createdAt: new Date()
    });

    M.toast({ html: `Welcome ${user.email}`, classes: "teal" });
    setTimeout(() => {
      window.location.href = 'welcome.html';
    }, 1000);
  } catch (error) {
    M.toast({ html: error.message, classes: "red" });
  }
}

document.getElementById('googleLoginButton')?.addEventListener('click', loginGoogle);

// Firestore Cart Functionality
document.addEventListener('DOMContentLoaded', function () {
  const cartButtons = document.querySelectorAll('.btn.waves-effect.waves-light.teal');
  const modal = document.querySelector('#modal3');
  const buyerDetailsForm = document.querySelector('#buyerDetailsForm');
  const cartTableBody = document.querySelector('table tbody');
  const totalAmountElement = document.querySelector('.total-amount');
  const buyerInfoSection = document.querySelector('.buyer-info');
  const checkoutConfirmBtn = document.getElementById('checkoutConfirmBtn');
  let totalAmount = 0;

  // Add product to cart
  cartButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      const productCard = event.target.closest('.col');
      const product = {
        name: productCard.querySelector('h4').textContent,
        price: productCard.querySelector('.price').textContent,
        quantity: productCard.querySelector('input[type="number"]').value,
        description: productCard.querySelector('.description').textContent,
        image: productCard.querySelector('img').src
      };

      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));

      const instance = M.Modal.getInstance(modal);
      instance.open();
    });
  });

  // Save buyer details and add to Firestore
  if (buyerDetailsForm) {
    buyerDetailsForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const buyerDetails = {
        name: buyerDetailsForm.querySelector('#buyerName').value,
        email: buyerDetailsForm.querySelector('#buyerEmail').value,
        phone: buyerDetailsForm.querySelector('#buyerPhone').value,
        address: buyerDetailsForm.querySelector('#buyerAddress').value,
        city: buyerDetailsForm.querySelector('#buyerCity').value,
        postalCode: buyerDetailsForm.querySelector('#buyerPostalCode').value
      };

      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      try {
        // Save order to Firestore
        await addDoc(collection(db, "orders"), {
          buyer: buyerDetails,
          cart,
          totalAmount,
          createdAt: new Date()
        });

        localStorage.setItem('buyerDetails', JSON.stringify(buyerDetails));
        M.toast({ html: 'Order added successfully!', classes: 'teal' });

        const modalInstance = M.Modal.getInstance(modal);
        modalInstance.close();
        buyerDetailsForm.reset();
      } catch (error) {
        M.toast({ html: error.message, classes: 'red' });
      }
    });
  }

  // Populate Cart from Firestore
  async function populateCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.forEach((item, index) => {
        const itemTotal = parseFloat(item.price.replace('Rs.', '')) * item.quantity;
        totalAmount += itemTotal;

        const row = `
          <tr>
            <td>
              <div class="row">
                <div class="col s2">
                  <img src="${item.image}" alt="${item.name}" class="responsive-img">
                </div>
                <div class="col s10">
                  <h5>${item.name}</h5>
                  <p>${item.description}</p>
                </div>
              </div>
            </td>
            <td>${item.price}</td>
            <td>${item.quantity}</td>
            <td>Rs. ${itemTotal}</td>
            <td><a href="#" class="btn red remove-btn" data-index="${index}">Remove</a></td>
          </tr>
        `;
        cartTableBody.insertAdjacentHTML('beforeend', row);
      });

      totalAmountElement.textContent = `Total Amount: Rs. ${totalAmount}`;

      const buyerDetails = JSON.parse(localStorage.getItem('buyerDetails'));
      if (buyerDetails) {
        buyerInfoSection.innerHTML = `
          <h5>Buyer Information</h5>
          <p>Name: ${buyerDetails.name}</p>
          <p>Email: ${buyerDetails.email}</p>
          <p>Phone: ${buyerDetails.phone}</p>
          <p>Address: ${buyerDetails.address}, ${buyerDetails.city}, ${buyerDetails.postalCode}</p>
        `;
      }

      // Remove item from cart
      document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function (event) {
          const index = event.target.getAttribute('data-index');
          cart.splice(index, 1);
          localStorage.setItem('cart', JSON.stringify(cart));
          location.reload();
        });
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }

  populateCart();

  // Confirm checkout
  if (checkoutConfirmBtn) {
    checkoutConfirmBtn.addEventListener('click', async function () {
      const buyerDetails = JSON.parse(localStorage.getItem('buyerDetails'));
      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      try {
        await addDoc(collection(db, "orders"), {
          buyer: buyerDetails,
          cart,
          totalAmount,
          createdAt: new Date()
        });

        localStorage.removeItem('cart');
        localStorage.removeItem('buyerDetails');
        M.toast({ html: 'Order placed successfully!', classes: 'teal' });
        location.reload();
      } catch (error) {
        M.toast({ html: error.message, classes: 'red' });
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);
});





