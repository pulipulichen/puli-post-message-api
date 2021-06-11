/* global Node */
let Index = {
  props: ['config', 'localConfig', 'utils'],
  data () {    
    this.$i18n.locale = this.config.localConfig
    return {
      fieldTitle: `布丁布丁吃什麼？`,
      fieldFavicon: `https://blog.pulipuli.info/favicon.ico`,
      fieldFindFavicon: ''
    }
  },
//  components: {
//  },
  computed: {
    faviconName () {
      if (this.fieldFavicon)
      {
         let u = new URL(this.fieldFavicon)
         return u.pathname
      }
      return "";
    },
    linkFavicon () {
      let icon = this.fieldFavicon
      let filename = this.faviconName
      console.log(filename)
      if (filename.endsWith('.ico')) {
        // https://blog.pulipuli.info/favicon.ico
        return `<link href="${icon}" rel="icon" type="image/x-icon">`
      }
      else if (filename.endsWith('.png')) {
        // https://lh3.googleusercontent.com/-tkBPlsBsFJg/V0M0b-gPKNI/AAAAAAACw9Y/Y-2BGg4z3H4/Image.jpg?imgmax=800
        return `<link rel="icon" type="image/png" href="${icon}" />`
      }
      else if (filename.endsWith('.jpg')
              || filename.endsWith('.jpeg')) {
        return `<link rel="icon" type="image/jpeg" href="${icon}" />`
      }
      else if (filename.endsWith('.gif')) {
        return `<link rel="icon" type="image/gif" href="${icon}" />`
      }
      return ''
    },
    fieldOutput () {
      return `<head>
  <title>${this.fieldTitle}</title>
  ${this.linkFavicon}
  <link rel="manifest" href="https://pulipulichen.github.io/Chrome-Shortcut-Head-Modifier/manifest-for-link.json">
</head>`
    },
    linkFindIcon () {
      return `https://findicons.com/search/` + encodeURIComponent(this.fieldFindFavicon)
    },
    linkIconNinja () {
      return `https://www.iconninja.com/tag/` + encodeURIComponent(this.fieldFindFavicon) + '-icon'
    }
  },
//  watch: {
//  },
  methods: {
    copyFieldOutput () {
      this.utils.ClipboardUtils.copyPlainString(this.fieldOutput)
    }
  }
}

export default Index