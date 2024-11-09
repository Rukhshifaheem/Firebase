// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc  } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
console.log(app)

const auth = getAuth(app);
auth.languageCode = 'en'
console.log(auth)

const provider = new GoogleAuthProvider();
console.log(provider);

const myModals = document.querySelectorAll('.modal');

// Signup Function
function signup(event) {
  event.preventDefault();
  const emailField = document.getElementById('SignupEmail');
  const passwordField = document.getElementById('SignupPassword');
  const email = emailField.value.trim();
  const password = passwordField.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User signed up successfully
      const user = userCredential;
      console.log('User signed up:', user);
      M.toast({ html: `Welcome ${user.user.email}`, classes: "green" })
      // window.location.pathname = 'signin.html'
    })
    .catch((error) => {
      // Handle sign-up errors
      M.toast({ html: error.message, classes: "red" })
    });

  emailField.value = "";
  passwordField.value = "";

  M.Modal.getInstance(myModals[0]).close();
}

function haveAccount(event) {
  event.preventDefault();
  M.Modal.getInstance(myModals[0]).close();
}

// Attach event listener to button
document.getElementById('signupButton')?.addEventListener('click', signup);

document.getElementById('alreadySignup')?.addEventListener('click', haveAccount);

function signin(event) {
  event.preventDefault();

  const emailField = document.getElementById('LoginEmail');
  const passwordField = document.getElementById('LoginPassword');
  const email = emailField.value.trim();
  const password = passwordField.value;

  // Check if both fields are filled
  if (email === '' || password === '') {
    M.toast({ html: 'Please fill out both email and password fields.', classes: "red" });
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log('Signed in successfully:', user);
      // M.toast({ html: `Signed in successfully.`, classes: "teal" });

      // Clear fields after successful sign-in
      emailField.value = "";
      passwordField.value = "";

      M.Modal.getInstance(myModals[1]).close();

      setTimeout(() => {
        window.location.pathname = './welcome.html';
      }, 1000); // 3000 ms = 3 seconds

      // Optionally redirect or store user info
      // sessionStorage.setItem("user", user.email);
      // window.location.pathname = './welcome.html';
    })
    .catch((error) => {
      console.log(error.message);
      M.toast({ html: error.message, classes: "red" });
    });
}

// Attach event listener to button
document.getElementById('loginButton')?.addEventListener('click', signin);

function logout() {
  signOut(auth).then(() => {
    console.log("SIgn-out successful.");
    M.toast({ html: "SIgn-out successful.", classes: "teal" });
    setTimeout(() => {
      window.location.pathname = './index.html';
    }, 1000); // 3000 ms = 3 seconds

  }).catch((error) => {
    console.log(error.message);
    M.toast({ html: error.message, classes: "red" });
  });
}

// Attach event listener to button
document.getElementById('signoutButton')?.addEventListener('click', logout);

// document.addEventListener('DOMContentLoaded', function () {
//   let elems = document.querySelectorAll('.modal');
//   let instances = M.Modal.init(elems);
// });

function loginGoogle(event) {
  event.preventDefault();

  signInWithPopup(auth, provider)
  .then((result) => {
    console.log(result);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log(credential);
    const user = result.user;
    M.toast({ html: `Welcome ${user.email}`, classes: "green" });

    // Redirect after successful sign-in
    setTimeout(() => {
      window.location.pathname = './welcome.html';
    }, 1000);
  })
  .catch((error) => {
    console.log(error.message);
    M.toast({ html: error.message, classes: "red" });
  });
}

document.getElementById('googleLoginButton')?.addEventListener('click', loginGoogle);

//Firestore Database

document.addEventListener('DOMContentLoaded', function () {
  let elems = document.querySelectorAll('.modal');
  let instances = M.Modal.init(elems);
});


// Initialize Cloud Firestore and get a reference to the service
// const db = firebase.firestore(auth);
// Initialize Cloud Firestore and get a reference to the service
const gfs = getFirestore(app); // Correct way to initialize Firestore
console.log(gfs);

//Cart Functionality

document.addEventListener('DOMContentLoaded', function () {
  const cartButtons = document.querySelectorAll('.btn.waves-effect.waves-light.teal');
  const modal = document.querySelector('#modal3');
  const buyerDetailsForm = document.querySelector('#buyerDetailsForm');
  const cartTableBody = document.querySelector('table tbody');
  const totalAmountElement = document.querySelector('.total-amount');
  const buyerInfoSection = document.querySelector('.buyer-info');
  const checkoutConfirmBtn = document.getElementById('checkoutConfirmBtn');
  let totalAmount = 0;

  // Add to cart and open modal
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

      // Save product to localStorage
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));

      // Open the modal for user details
      const instance = M.Modal.getInstance(modal);
      instance.open();
    });
  });

  // Save user details to localStorage when form is submitted
  if (buyerDetailsForm) {
    buyerDetailsForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const buyerDetails = {
        name: buyerDetailsForm.querySelector('#buyerName').value,
        email: buyerDetailsForm.querySelector('#buyerEmail').value,
        phone: buyerDetailsForm.querySelector('#buyerPhone').value,
        address: buyerDetailsForm.querySelector('#buyerAddress').value,
        city: buyerDetailsForm.querySelector('#buyerCity').value,
        postalCode: buyerDetailsForm.querySelector('#buyerPostalCode').value
      };

      localStorage.setItem('buyerDetails', JSON.stringify(buyerDetails));
      M.toast({ html: 'Added to cart!' });

      // Close modal after saving
      const modalInstance = M.Modal.getInstance(modal);
      modalInstance.close();

      // Clear form fields
      buyerDetailsForm.reset();
    });
  }

  // Load and display cart items
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

  // Update total amount
  totalAmountElement.textContent = `Total Amount: Rs. ${totalAmount}`;

  // Display buyer details if available
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
      location.reload(); // Reload to reflect changes
    });
  });

  // Clear buyer details and redirect to shop page on checkout confirmation
  if (checkoutConfirmBtn) {
    checkoutConfirmBtn.addEventListener('click', function () {
      localStorage.removeItem('buyerDetails');
      localStorage.removeItem('cart'); // Clear the cart as well
      window.location.href = 'shop.html'; // Redirect to shop page
    });
  }
});




