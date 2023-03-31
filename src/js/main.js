import './icon'
import Swiper from './Swiper'


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

    // 当currentTime更新时会触发timeupdate事件
    this.audio.ontimeupdate = function() {
      console.log(parseInt(self.audio.currentTime*1000))
      self.locateLyric()
      self.setProgerssBar()
    }

    let swiper = new Swiper(this.$('.panels'))
    swiper.on('swipLeft', function() {
      console.log(this);
      this.classList.remove('panel-1')
      this.classList.add('panel-2')
    })
    swiper.on('swipRight', function() {
      console.log(this);
      this.classList.remove('panel-2')
      this.classList.add('panel-1')
    })

  }

  // audio加载音乐
  loadSong() {
    let songObj = this.songList[this.currentIndex]
    this.$('.header h1').innerText = songObj.title
    this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
    this.audio.src = songObj.url
    this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)
    
    this.loadLyric()
  }

  // 加载歌词
  loadLyric() {
    fetch(this.songList[this.currentIndex].lyric)
     .then(res => res.json())
     .then(data => {
      console.log(data.lrc.lyric);
      this.setLyrics(data.lrc.lyric)
     })
  }

// 当播放时间大于歌词列表的下一段时间就触发歌词滚动，并且更新主界面歌词
  locateLyric() {
    if (this.lyricIndex === this.lyricsArr.length - 1) return
    let currentTime = this.audio.currentTime * 1000
    let nextLineTime = this.lyricsArr[this.lyricIndex + 1][0]

    if (currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
      this.lyricIndex++
      let node = this.$(`[data-time='${this.lyricsArr[this.lyricIndex][0]}']`)
      // 歌词滚动
      if (node) this.setLyricToCenter(node)
      // 歌词挂到主界面
      this.$$('.panels .panel-effect .lyrics p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
      this.$$('.panels .panel-effect .lyrics p')[1].innerText = this.lyricsArr[this.lyricIndex+1] ? this.lyricsArr[this.lyricIndex+1][1] : ''
    }
  }

  // 歌词滚动，当前歌词（距离顶部位置 - 歌词列表区域的高度）大于0则滚动减去的距离
  setLyricToCenter(node) {
    let translateY = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 2
    translateY = translateY > 0 ? translateY : 0
    this.$('.panel-lyrics .container').style.transform = `translateY(-${translateY}px)`
    this.$$('.panel-lyrics p').forEach(node => node.classList.remove('current'))
    node.classList.add('current')
  }

  // 歌词挂载到html上
  setLyrics(lyrics) {
    this.lyricIndex = 0
    let fragment = document.createDocumentFragment()
    let lyricsArr = []
    this.lyricsArr = lyricsArr
    lyrics.split(/\n/)
      .filter(str => str.match(/\[.+?\]/))
      .forEach(line => {
        let str = line.replace(/\[.+?\]/g, '')
        line.match(/\[.+?\]/g).forEach(t => {
          t = t.replace(/[\[\]]/g, '')
          let milliseconds = parseInt(t.slice(0,2))*60*1000 + parseInt(t.slice(3,5))*1000 + parseInt(t.slice(6))
          lyricsArr.push([milliseconds, str])
        })
      })
      lyricsArr.filter(line => line[1].trim() !== '')
       .sort((v1, v2) => v1[0] > v2[0] ? 1 : -1)
       .forEach(line => {
        let node = document.createElement('p')
        node.setAttribute('data-time', line[0])
        node.innerText = line[1]
        fragment.appendChild(node)
       })
       this.$('.panel-lyrics .container').innerHTML = ''
       this.$('.panel-lyrics .container').appendChild(fragment)

  }

  setProgerssBar() {
    let percent = (this.audio.currentTime * 100 /this.audio.duration) + '%'
    console.log(percent)
    this.$('.bar .progress').style.width = percent
    this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
  }

  formateTime(secondsTotal) {
    let minutes = parseInt(secondsTotal/60)
    minutes = minutes >= 10 ? '' + minutes : '0' + minutes
    let seconds = parseInt(secondsTotal%60)
    seconds = seconds >= 10 ? '' + seconds : '0' + seconds
    return minutes + ':' + seconds
  }

  playSong() {
    this.audio.oncanplaythrough = () => this.audio.play()
  }

  
}

new Player('#player')