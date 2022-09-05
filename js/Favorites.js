import { GithubUser } from "./GithubUser.js"

// Data struct
export class Favorites {
  constructor(root){
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
    if (this.entries.length == 0) {
      this.noFavorite()
    }
  }

  async add(username) {

    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado')
      } 

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }
}

// handle HTML events and appearance
export class FavoritesView extends Favorites {
  constructor(root){
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    const searchInput = this.root.querySelector('.search input')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }

    searchInput.onkeydown = e => {
      if (e.key === 'Enter') {
        const value = searchInput.value
        this.add(value)
      }
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar esse favorito?')
       
        if(isOk) {
          this.delete(user)
        }
      }


      if (this.entries.length > 0) {
        this.favoriteAdded()
      } 
      
      this.tbody.append(row)
    })
  }

  favoriteAdded() {
    const noFavoriteArea = this.root.querySelector('.no-fav-container')
    const container = this.root.querySelector('.container')
    noFavoriteArea.classList.add('hide')
    container.classList.remove('no-favorite')
  }

  noFavorite() {
    const noFavoriteArea = this.root.querySelector('.no-fav-container')
    const container = this.root.querySelector('.container')
    noFavoriteArea.classList.remove('hide')
    container.classList.add('no-favorite')
  }

  createRow() {
    const tr = document.createElement('tr')

    const content = `
    <td>
      <div class="user">
        <img src="https://github.com/ggalli.png" alt="Imagem de Jessica Adamek">
        <a href="https://github.com/ggalli" target="_blank">
          <p>Guilherme Galli</p>
          <span>/ggalli</span>
      </div>
      </a>
    </td>
    <td class="repositories">
      78
    </td>
    <td class="followers">
      1000
    </td>
    <td>
      <span class="remove">Remover</span>
    </td>
      `

    tr.innerHTML = content

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}