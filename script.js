const mealEl_container = document.querySelector('.meal')
const fav_meals_container = document.querySelector('.fav-meals');

const search_input = document.querySelector('.search-input');
const search_icon = document.querySelector('.search-icon');

const popup_container = document.querySelector('.pop-up-container');
const close_popup_btn = document.querySelector('.pop-up > i');
const popup = document.querySelector('.pop-up-inner');

const lightDarkModeSpan = document.querySelector('.light-dark-mode');
const lightDarkModeIcon = document.querySelector('.light-dark-mode > i');

getRandomMeal()
fetchFavMeals()

async function getRandomMeal () {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json()
    const random_meal = respData.meals[0];
    console.log(random_meal);
    addMeal(random_meal)
}

async function getMealById (id) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const respData = await resp.json()
    const meal = respData.meals[0];
    
    return meal;
}

async function getMealsBySearch (term) {
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
    const respData = await resp.json()
    const meals = respData.meals;

    return meals;
}

function addMeal (meal) {
    const meal_card = document.createElement('div');
    meal_card.classList.add('meal-card');
    meal_card.innerHTML = `
            <div class="meal-card-img-container">
                <img src="${meal.strMealThumb}">
            </div>
            <div class="meal-name">
                <p>${meal.strMeal}</p>
                <i class="fa-regular fa-heart"></i>
            </div>
    `

    const btn = meal_card.querySelector('.fa-heart');
    btn.addEventListener('click', () => {
        if (btn.classList.contains('fa-regular')) {
            btn.setAttribute('class', 'fa-solid fa-heart')
            addMealLS(meal.idMeal)
        } else {
            btn.setAttribute('class', 'fa-regular fa-heart')
            removeMealLS(meal.idMeal)
        }
        fetchFavMeals()
    })

    meal_card.firstChild.nextSibling.addEventListener('click', () => {
        showMealPopup(meal)
    })

    mealEl_container.appendChild(meal_card)
}

function addMealLS (mealID) {
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealID]))
}

function removeMealLS (mealID) {
    const mealIds = getMealLS()
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealID)))
}

function getMealLS () {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds
}

async function fetchFavMeals () {
    fav_meals_container.innerHTML = '';

    const mealsIds = getMealLS();
    const meals = [];
    for(let i = 0; i < mealsIds.length; i++) {
        const mealID = mealsIds[i];
        meal = await getMealById(mealID)
        addMealToFav(meal)
        meals.push(meal)
    }
}

function addMealToFav (meal) {
    const fav_meals = document.createElement('div');
    fav_meals.innerHTML = `
            <div class="single">
                <div class="top">
                    <div class="img-container">
                        <img src="${meal.strMealThumb}">
                    </div>
                    <div class="text">
                        <p>${meal.strMeal}</p>
                    </div>
                </div>
                <i class="fa-solid fa-x"></i>
            </div>
    `
    const x = fav_meals.querySelector('.fa-x');
    x.addEventListener('click', () => {
        removeMealLS(meal.idMeal)

        const heart_btns = document.querySelectorAll('.fa-heart');
        heart_btns.forEach(heart_btn => {
            heart_btn.setAttribute('class', 'fa-regular fa-heart');
        })

        fetchFavMeals()
    })

    fav_meals.firstChild.nextSibling.firstChild.nextSibling.addEventListener('click', () => {
        showMealPopup(meal)
    })

    fav_meals_container.appendChild(fav_meals)
}

search_icon.addEventListener('click', async () => {
    mealEl_container.innerHTML = '';
    const searchVal = search_input.value;
    const meals = await getMealsBySearch(searchVal)
    if (meals) {
        meals.forEach(meal => {
            addMeal(meal)
        })
        document.querySelector('.meals-container > h2').innerText = 'Search Results...'
    } else {
        document.querySelector('.meals-container > h2').innerText = 'No Meals Found'
        mealEl_container.innerHTML = '';
    }
})

close_popup_btn.addEventListener('click', () => {
    popup_container.style.display = 'none';
})
function showMealPopup (meal) {
    popup.innerHTML = ''

    const newPopup = document.createElement('div');
    newPopup.classList.add('pop-up-inner');

    const ingredients = [];
    for(let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
        } else {
            break
        }
    }

    newPopup.innerHTML = `
        <div class="left">
            <div class="meal-card">
                <div class="meal-card-img-container">
                    <img src="${meal.strMealThumb}" alt="">
                </div>
                <div class="meal-name">
                    <p>${meal.strMeal}</p>
                    <i class="fa-regular fa-heart"></i>
                </div>
            </div>
        </div>
        <div class="right">
            <div>
                <h2>Intructions</h2>
                <p class="meal-info">${meal.strInstructions}</p>
            </div>
            <div>
                <h2>Ingredients / Measures</h2>
                <ul>
                    ${ingredients.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        </div>
    `
    popup.appendChild(newPopup);
    popup_container.style.display = 'flex';
}

lightDarkModeSpan.addEventListener('click', () => {
    if (lightDarkModeIcon.classList.contains('fa-sun')) {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-moon')
    } else {
        lightDarkModeIcon.setAttribute('class', 'fa-solid fa-sun')
    }

    document.documentElement.classList.toggle('light-theme');
})


// EXPLANATION

// How does the app fetch a random meal?
// Answer: The app uses the getRandomMeal function, which sends a GET request to the TheMealDB API endpoint (/random.php) using the fetch API. It then processes the response as JSON and displays the meal by calling addMeal(random_meal).

// What is the purpose of getMealsBySearch and how does it work?
// Answer: getMealsBySearch fetches meals that match a search term by sending a GET request to the API endpoint /search.php?s=term. It processes the response as JSON and returns the array of meals to the caller.

// How is local storage used in this app?
// Answer: Local storage is used to store the IDs of favorite meals.
// addMealLS adds a meal ID to local storage.
// removeMealLS removes a meal ID.
// getMealLS retrieves all saved meal IDs.

// How does the app ensure synchronization between the UI and local storage for favorite meals?
// Answer: When a meal is added or removed as a favorite (addMealLS or removeMealLS), the fetchFavMeals function is called to refresh the UI with the updated list of favorite meals. Additionally, heart icons are toggled to reflect the current favorite state.

// How are meal details displayed in a popup?
// Answer: The showMealPopup function dynamically creates a detailed view of the meal using its ingredients, instructions, and an image. This is appended to the popup container, which is then made visible by setting its display style to flex.

// How is dark/light mode toggled in the application?
// Answer: The lightDarkModeSpan click event toggles a light-theme class on the document.documentElement element and switches the icon between a sun and a moon to visually represent the mode.

// How does the app handle click events for heart icons in meal cards?
// Answer: A click event listener on the heart icon toggles the icon's class between fa-regular and fa-solid, indicating whether the meal is favorited. It then updates local storage (addMealLS or removeMealLS) and refreshes the favorite meals UI (fetchFavMeals).

// How are meal ingredients and measures handled in the popup?
// Answer: Ingredients and measures are dynamically extracted using a loop over keys (strIngredient1, strMeasure1, etc.). Non-empty values are pushed to the ingredients array and displayed in a list within the popup.

// What happens if the search returns no results?
// Answer: If no meals are returned from getMealsBySearch, the app updates the header to "No Meals Found" and clears any previous results from the meal container.

// How does the app ensure the heart icons in the main UI are in sync with favorite meals in local storage?
// Answer: After removing a meal from favorites, the app iterates over all heart icons and resets them to fa-regular. This ensures the icons visually reflect the current state.