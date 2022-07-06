const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'
const userPanel = document.querySelector('#user-panel')
const users = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const searchHint = document.querySelector('#search-hint')
let filteredUsers = []
const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
const USERS_PER_PAGE = 9
const paginator = document.querySelector('#paginator')
const paginatorPages = document.querySelector('.pages-box')
const prevPaginatorBtn = document.querySelector('.prev-btn')
const nextPaginatorBtn = document.querySelector('.next-btn')
const popOver = document.querySelector('#movie-modal')
let currentPage = 1
let viewState = 'group'
const viewBox = document.querySelector('#view-box')

function renderUserGroup(data) {
    let list = ''
    data.forEach((item) => {
        list += `
  <div class="col-12 col-md-4 mb-5 card-box">
    <div class="card mx-auto show">
      <div class="image-box">
      <img src="${item.avatar}">
        <div class="plus-icon btn-add-favorite" data-id="${item.id}">
          <svg viewBox="0 0 512 512" width="100" title="heart">
  <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
        </svg>
      </div>
    </div>
      <div class="card-body">
        <div class="name">${item.name} ${item.surname}</div>
      </div>
      <div class="card-footer">
        <button class="show-info-btn" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">MORE</button>
      </div>
    </div>
  </div>`
    })
    userPanel.innerHTML = list
}

function renderUserList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        // title, image, id
        rawHTML += `
    <div class="list-group-item list-group-item-action p-3">
    <div class="d-flex w-100 justify-content-between align-items-center">
      <div class="image-box"><img src="${item.avatar}"></div>
      <div class="list-title flex-fill">
        <h5 class="mb-0">${item.name} ${item.surname}</h5>
        <p class="mb-0">${item.region}</p>
      </div>
      <div class="d-flex">
        <button class="btn btn-info btn-add-favorite btn-list-favorite" data-id="${item.id
            }"><svg viewBox="0 0 512 512" width="100" title="heart">
  <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
        </svg></button>
        <button class="btn btn-dark show-info-btn" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
            }">More</button>
      </div>
    </div>
  </div>`
    })
    userPanel.innerHTML = rawHTML
}

function showUserInfo(id) {
    const modalTitle = document.querySelector('#user-modal-name')
    const modalImage = document.querySelector('#user-modal-image')
    const modalDate = document.querySelector('#user-modal-birthday')
    const modalMail = document.querySelector('#user-modal-mail')
    const modalAge = document.querySelector('#user-modal-age')
    const modalregion = document.querySelector('#user-modal-region')
    popOver.classList.add('show')
    axios.get(INDEX_URL + '/' + id).then((response) => {
        const data = response.data
        modalTitle.innerText = `${data.name} ${data.surname}`
        modalDate.innerText = `Birthday: ${data.birthday}`
        modalMail.innerText = data.email
        modalAge.innerText = data.age
        modalregion.innerText = data.region
        modalImage.src = data.avatar
    }).catch(function (error) {
        // handle error
        console.log(error);
    })
}
//search 監聽
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
    e.preventDefault()
    const keyword = (searchInput.value.trim().toLowerCase()).split(' ').join('')
    searchInput.value = ""
    if (!keyword.length) {
        return alert('請輸入有效字串！')
    } else {
        currentPage = 1
    }
    //條件篩選
    filteredUsers = users.filter((user) => {
        const keywordName = (user.name.toLowerCase() + user.surname.toLowerCase()).split(' ').join('')
        return keywordName.includes(keyword)
    })
    if (filteredUsers.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的用戶`)
    }
    // 更新 search-hint
    let rawHTML = ''
    rawHTML += `<div class="d-flex search-item justify-content-between">Keyword: ${keyword}<div class="ml-2 search-refresh"><i class="fa-solid fa-arrow-rotate-right"></i></div></div>`
    searchHint.innerHTML = rawHTML
    //重新輸出至畫面
    renderPaginator(filteredUsers.length)
    if (viewState == "group") {
        renderUserGroup(getUserbyPage(currentPage))
    } else if (viewState == "list") {
        renderUserList(getUserbyPage(currentPage))
    }
    getFavUser(getUserbyPage(currentPage))
})

searchHint.addEventListener('click', (event) => {
    currentPage = 1
    filteredUsers = []
    renderPaginator(users.length)
    if (event.target.matches('.search-refresh')) {
        searchHint.innerHTML = ""
        if (viewState == "group") {
            renderUserGroup(getUserbyPage(currentPage))
        } else if (viewState == "list") {
            renderUserList(getUserbyPage(currentPage))
        }
        getFavUser(getUserbyPage(currentPage))
    }
})

//取消最愛
function removeFavUser(id) {
    if (!list || !list.length) return

    //透過 id 找到要刪除電影的 index
    const userIndex = list.findIndex((user) => { return user.id === id })
    if (userIndex === -1) return

    //刪除該筆電影
    list.splice(userIndex, 1)

    //存回 local storage
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//存取加入最愛
function addToFavorite(id) {
    const favUser = users.find((user) => { return user.id === id })
    if (list.some((user) => user.id === id)) {
        removeFavUser(id)
    } else {
        list.push(favUser)
        localStorage.setItem('favoriteUsers', JSON.stringify(list))
    }
}

//更新home已加入最愛的icon顯示
function getFavUser(data) {
    list.map((item) => {
        const favId = data.find((user) => { return user.id === item.id })
        if (favId !== null && favId !== undefined) {
            document.querySelector('.btn-add-favorite[data-id="' + favId.id + '"]').classList.add('favorite')
        }
    })
}

//分頁
function getUserbyPage(page) {
    const data = filteredUsers.length ? filteredUsers : users
    const startIndex = (page - 1) * USERS_PER_PAGE
    return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//分頁器
function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
    //製作 template
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }

    //放回 HTML
    paginatorPages.innerHTML = rawHTML
    // 預設 page1 樣式
    document.querySelector('.page-link[data-page="1"]').parentElement.classList.add('active')
}

//分頁監聽
paginator.addEventListener('click', function onPaginatorClicked(event) {
    //如果被點擊的不是 a 標籤，結束
    if (event.target.tagName !== 'A') return

    if (event.target.getAttribute("aria-label") == 'Previous') {
        currentPage--
        if (currentPage < 1) {
            currentPage = 1
        }
    } else if (event.target.getAttribute("aria-label") == 'Next') {
        currentPage++
        if (currentPage > parseInt(document.querySelectorAll('.page-link').length - 2)) {
            currentPage = parseInt(document.querySelectorAll('.page-link').length - 2)
        }
    }
    document.querySelectorAll('.page-item').forEach((item, idx) => { item.classList.remove('active') })
    document.querySelector('.page-link[data-page="' + currentPage + '"]').parentElement.classList.add('active')

    //透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page)
    //更新畫面
    if (page) {
        currentPage = page
        document.querySelectorAll('.page-item').forEach((item, idx) => {
            item.classList.remove('active')
        })
        const activePage = document.querySelector('.page-link[data-page="' + page + '"]').parentElement
        activePage.classList.add('active')
    }
    if (viewState == "group") {
        renderUserGroup(getUserbyPage(currentPage))
    } else if (viewState == "list") {
        renderUserList(getUserbyPage(currentPage))
    }
    getFavUser(getUserbyPage(currentPage))
})

//user card 監聽
userPanel.addEventListener('click', (event) => {
    if (event.target.matches('.show-info-btn')) {
        showUserInfo(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
        event.target.classList.toggle('favorite')
    }
})

// change view
viewBox.addEventListener('click', (event) => {
    if (event.target.matches('.list-view')) {
        viewState = 'list'
        renderUserList(getUserbyPage(currentPage))
    } else if (event.target.matches('.group-view')) {
        viewState = 'group'
        renderUserGroup(getUserbyPage(currentPage))
    }

    getFavUser(getUserbyPage(currentPage))
})

axios.get(INDEX_URL)
    .then(function (response) {
        // handle success
        users.push(...response.data.results)
        renderPaginator(users.length)
        if (viewState == "group") {
            renderUserGroup(getUserbyPage(currentPage))
        } else if (viewState == "list") {
            renderUserList(getUserbyPage(currentPage))
        }
        getFavUser(getUserbyPage(1))
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })




