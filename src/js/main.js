import './icon'
console.log('hi');


class Player {
  constructor(node) {
    this.root = typeof node === 'string' ? document.querySelector(node) : node
    this.$ = selector => this.root.querySelector(selector)
    this.$$ = selector => this.root.querySelectorAll(selector)
    this.songList = []
    this.currentIndex = 0
    this.audio = new Audio()
    this.lyricsArr = []
    this.lyricIndex = -1

    this.start()
    this.bind()
    //https://jirengu.github.io/data-mock/huawei-music/music-list.json
  }

  start() {
    fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
      .then(res => res.json())
      .then(data => {
        console.log(data)
        this.songList = data
        this.loadSong()
      })
  }

  bind() {
    let self = this
    // 播放键
    this.$('.btn-play-pause').onclick = function() {
      if (self.audio.paused) {
        self.audio.play()
        this.classList.remove('pause')
        this.classList.add('playing')
        this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
      } else {
        self.audio.pause()
        this.classList.remove('playing')
        this.classList.add('pause')
        this.querySelector('use').setAttribute('xlink:href', '#icon-play')
      }

      // if (this.classList.contains('playing')) {
      //   console.log(self.audio.paused);
      //   self.audio.pause()
      //   this.classList.remove('playing')
      //   this.classList.add('pause')
      //   this.querySelector('use').setAttribute('xlink:href', '#icon-play')
      // } else if (this.classList.contains('pause')) {
      //   self.audio.play()
      //   this.classList.remove('pause')
      //   this.classList.add('playing')
      //   this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
      // }
    }

    // 上一首
    this.$('.btn-pre').onclick = function() {
      if (self.currentIndex <= 0) {
        self.currentIndex = 4
      } else {
        self.currentIndex -= 1
      }
      self.loadSong()
      self.playSong()
    }

    // 下一首
    this.$('.btn-next').onclick = function() {
      self.currentIndex = (self.currentIndex + 1) % self.songList.length
      self.loadSong()
      self.playSong()
    }

  }

  // audio加载音乐
  loadSong() {
    console.log(this.currentIndex);
    let songObj = this.songList[this.currentIndex]
    this.audio.src = songObj.url
  }

  playSong() {
    this.audio.oncanplaythrough = () => this.audio.play()
  }

}

new Player('#player')