const App = {
  data() {
    return {
      quoteContent: "",
      quoteAuthor: "",
      quoteLength: "",
      welcomeScreen: true,
      welcomeTitle: "Welcome to TypeQuote!",
      welcomeText: "This app allows you to practice your typing speed and also learn many interesting quotes and aphorisms of great people. Click the button below to get started!",
      errorText: "Sorry, this app is designed to be used with keyboards, therefore mobile devices are not supported.",
      title: "TypeQuote",
      lowRes: false,
      sidebarActive: false,
      placeholder: "Type here",
      inputText: "",
      textIsDisabled: false,
      btnIsDisabled: true,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      totalTime: 0,
      time: null,
      cpmCounter: null,
      mistakeIndex: -1,
      mistakes: 0,
      lockMistake: false,
      lockIndex: -1,
      correct: 0,
      accuracy: 100,
      cpm: 0
    }
  },

  created() {
    this.getQuote();
    if (window.matchMedia('(max-width: 800px)').matches) {
      this.lowRes = true;
      this.welcomeText = this.errorText;
    }
  },

  methods: {
    startApp() {
      this.welcomeScreen = false;
      this.$nextTick(() => this.$refs.textarea.focus());
      this.$nextTick(() => this.start());
      this.sidebarActive = true;

      if (window.matchMedia('(max-width: 1450px)').matches) {
        this.sidebarActive = false;
      }
    },

    removePlaceholder() {
      this.placeholder = "";
    },

    addPlaceholder() {
      this.placeholder = "Type here"
    },

    getQuote() {
      return fetch('http://api.quotable.io/random', {
          headers: {
            'content-type': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Something went wrong. Please try again later');
          }

        })
        .then(response => {
          this.quoteContent = response.content;
          this.quoteAuthor = response.author;
          this.quoteLength = response.length;
        })
        .catch(error => alert(error))
    },

    timer() {
      this.totalTime += 10;
      if ((this.milliseconds += 10) == 1000) {
        this.milliseconds = 0;
        this.seconds++;

      }
      if (this.seconds == 60) {
        this.seconds = 0;
        this.minutes++;
      }
    },

    cpmCount() {
      if ((this.correct !== 0 || this.mistakes !== 0) && this.totalTime !== 0) {
        this.cpm = Math.round(((this.correct + this.mistakes) / this.totalTime) * 60000);
      }

    },

    start() {
      this.time = setInterval(() => {
        this.timer();
      }, 10);
      this.cpmCounter = setInterval(() => {
        this.cpmCount();
      }, 100);
    },

    stop() {
      clearInterval(this.time);
      clearInterval(this.cpmCounter);
    },

    reset() {
      this.milliseconds = 0;
      this.seconds = 0;
      this.totalTime = 0;
      this.minutes = 0;
      this.inputText = "";
      this.mistakes = 0;
      this.cpm = 0;
      this.correct = 0;
      this.lockMistake = false;
      this.textIsDisabled = false;
      this.btnIsDisabled = true;
      this.accuracy = 100;
      if (window.matchMedia('(max-width: 1450px)').matches) {
        this.sidebarActive = false;
      }
    },

    async nextQuote() {
      await this.getQuote();
      this.reset();
      this.start()
      this.$nextTick(() => this.$refs.textarea.focus());

    },

  },

  computed: {
    getTime() {
      let displayMin = this.minutes > 10 ? this.minutes : `0${this.minutes}`;
      let displaySecs = this.seconds >= 10 ? this.seconds : `0${this.seconds}`;
      let displayMilis = this.milliseconds >= 100 ? this.milliseconds : (this.milliseconds >= 10 && this.milliseconds < 100) ? `0${this.milliseconds}` : `00${this.milliseconds}`
      return displayMin + ":" + displaySecs + ":" + displayMilis;
    },

    quoteOutput() {
      let quoteStr = '<span class="correct">';
      let complete = '<span class="complete">' + this.quoteContent + '</span>'
      if (this.textIsDisabled) {
        return complete;
      } else if (this.mistakeIndex === -1) {

        quoteStr += this.quoteContent.substr(0, this.inputText.length);
        quoteStr += '</span>';
        quoteStr += this.quoteContent.substr(this.inputText.length);

        return quoteStr;
      } else {
        quoteStr += this.quoteContent.substr(0, this.mistakeIndex)
        quoteStr += '</span>'
        quoteStr += '<span class="wrong">'
        quoteStr += this.quoteContent.substring(this.mistakeIndex, this.inputText.length)
        quoteStr += '</span>'
        quoteStr += this.quoteContent.substr(this.inputText.length)

        return quoteStr;
      }



    }
  },

  watch: {
    inputText(value) {

      for (let i = 0; i < value.length; i++) {
        if (value[i] !== this.quoteContent[i]) {
          this.mistakeIndex = i;
          this.lockIndex = i;

          break;
        }

        this.mistakeIndex = -1;

      }

      if (this.lockMistake === false && this.lockIndex !== -1) {
        this.mistakes++;
        this.lockMistake = true;

      }

      if (value[this.lockIndex] === this.quoteContent[this.lockIndex] && value.length !== 0) {
        this.correct++;
        this.lockMistake = false;
        this.lockIndex = -1;
      }

      if (value === this.quoteContent) {
        this.stop();
        this.textIsDisabled = true;
        this.btnIsDisabled = false;
        if (window.matchMedia('(max-width: 1450px)').matches) {
          this.sidebarActive = true;
        }
      }

      if (this.correct !== 0 || this.mistakes !== 0) {
        this.accuracy = Math.round((this.correct / (this.correct + this.mistakes)) * 100);
      }
    }
  }
}


Vue.createApp(App).mount("#app");