const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'
const userPanel = document.querySelector('#user-panel')
const users = JSON.parse(localStorage.getItem('favoriteUsers')) || []
let filteredUsers = []
let viewState = 'group'
const viewBox = document.querySelector('#viewBox')

function renderUserGroup(data) {
    let list = ''
    data.forEach((item) => {
        list += `
  <div class="col-12 col-md-4 mb-5 card-box">
    <div class="card mx-auto show">
      <div class="image-box">
      <img src="${item.avatar}">
        <div class="plus-icon btn-add-favorite favorite" data-id="${item.id}">
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
        <button class="btn btn-info btn-add-favorite btn-list-favorite favorite" data-id="${item.id
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
    axios.get(INDEX_URL + '/' + id).then((response) => {
        const data = response.data
        console.log(data.birthday)
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

// 移除我的最愛
function removeFavUser(id) {
    if (!users || !users.length) return

    //透過 id 找到要刪除電影的 index
    const userIndex = users.findIndex((user) => { return user.id === id })
    if (userIndex === -1) return

    //刪除該筆電影
    users.splice(userIndex, 1)

    //存回 local storage
    localStorage.setItem('favoriteUsers', JSON.stringify(users))

    //更新頁面
    if (viewState == "group") {
        renderUserGroup(users)
    } else if (viewState == "list") {
        renderUserList(users)
    }
}

// user card 監聽
userPanel.addEventListener('click', (event) => {
    if (event.target.matches('.show-info-btn')) {
        showUserInfo(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite.favorite')) {
        event.target.classList.remove('favorite')
        removeFavUser(Number(event.target.dataset.id))
    }
})

// change view
viewBox.addEventListener('click', (event) => {
    if (event.target.matches('.list-view')) {
        viewState = 'list'
        renderUserList(users)
    } else if (event.target.matches('.group-view')) {
        viewState = 'group'
        renderUserGroup(users)
    }
})

axios.get(INDEX_URL)
    .then(function (response) {
        // handle success
        console.log(users)
        if (viewState == "group") {
            renderUserGroup(users)
        } else if (viewState == "list") {
            renderUserList(users)
        }
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })




