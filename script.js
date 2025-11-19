// Path to JSON file
const COURSES_URL = './courses.json';

// Arrays to store courses and filtered results
let courses = [];
let filteredCourses = [];

// State for pagination, search, category, and sort
let state = {
  page: 1,
  perPage: 4,
  sort: 'default',
  search: '',
  category: 'all'
};

// Get elements from page
const coursesList = document.getElementById('coursesList');
const pagination = document.getElementById('pagination');
const perPageSelect = document.getElementById('perPage');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const courseSelect = document.getElementById('courseSelect');
const yearSpan = document.getElementById('year');
const signupForm = document.getElementById('signupForm');
const signupMessage = document.getElementById('signupMessage');

// Load courses from JSON
async function loadCourses() {
  try {
    const res = await fetch(COURSES_URL);
    courses = await res.json();
    setupFilters();
    showCourses();
  } catch {
    coursesList.innerHTML = '<p>Could not load courses.</p>';
  }
}

// Setup category filter and signup course dropdown
function setupFilters() {
  const categories = [...new Set(courses.map(c => c.category))];
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  courses.forEach(c => {
    const option = document.createElement('option');
    option.value = c.courseId;
    option.textContent = `${c.title} — ${c.instructor}`;
    courseSelect.appendChild(option);
  });
}

// Filter, search, and sort courses
function showCourses() {
  filteredCourses = courses.filter(c => {
    const searchText = state.search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(searchText) || c.instructor.toLowerCase().includes(searchText);
    const matchCategory = state.category === 'all' || c.category === state.category;
    return matchSearch && matchCategory;
  });

  // Sort courses
  if (state.sort === 'rating-desc') filteredCourses.sort((a, b) => b.rating - a.rating);
  else if (state.sort === 'rating-asc') filteredCourses.sort((a, b) => a.rating - b.rating);
  else if (state.sort === 'price-asc') filteredCourses.sort((a, b) => parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1)));
  else if (state.sort === 'price-desc') filteredCourses.sort((a, b) => parseFloat(b.price.slice(1)) - parseFloat(a.price.slice(1)));
  else if (state.sort === 'enrolled-desc') filteredCourses.sort((a, b) => b.enrolled - a.enrolled);

  state.page = 1;
  renderCourses();
}

// Render current page of courses
function renderCourses() {
  const start = (state.page - 1) * state.perPage;
  const pageCourses = filteredCourses.slice(start, start + state.perPage);

  coursesList.innerHTML = pageCourses.map(c => `
    <article class="course-card">
      <h3>${c.title}</h3>
      <div class="meta">${c.instructor} • ${c.duration} • <span class="badge">${c.category}</span></div>
      <p class="meta">Rating: ${c.rating} • Price: ${c.price} • Enrolled: ${c.enrolled}</p>
    </article>
  `).join('');

  renderPagination();
}

// Render pagination buttons
function renderPagination() {
  const pages = Math.ceil(filteredCourses.length / state.perPage);
  pagination.innerHTML = '';

  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === state.page) btn.style.fontWeight = 'bold';
    btn.onclick = () => { state.page = i; renderCourses(); };
    pagination.appendChild(btn);
  }
}

// Event listeners for search, filters, sort, and per page
searchInput.oninput = () => { state.search = searchInput.value; showCourses(); };
categoryFilter.onchange = () => { state.category = categoryFilter.value; showCourses(); };
sortSelect.onchange = () => { state.sort = sortSelect.value; showCourses(); };
perPageSelect.onchange = () => { state.perPage = +perPageSelect.value; renderCourses(); };

// Signup form validation
signupForm.onsubmit = e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;
  const selectedCourse = courseSelect.value;

  if (name.length < 3) return alert('Name too short');
  if (!email.includes('@')) return alert('Invalid email');
  if (password.length < 6) return alert('Password too short');
  if (password !== confirm) return alert('Passwords do not match');
  if (!selectedCourse) return alert('Select a course');

  signupMessage.textContent = 'Successfully Registered!';
  signupForm.reset();
};

// Show current year in footer
yearSpan.textContent = new Date().getFullYear();

// Load courses on page load
loadCourses();
