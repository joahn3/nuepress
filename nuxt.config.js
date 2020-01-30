import axios from 'axios';

export default {
  mode: 'universal',

  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto+Slab:400,500|Roboto:300,400&display=fallback' }
    ]
  },

  loading: { color: '#fff' },

  css: ['normalize.css/normalize.css'],

  plugins: [
    { src: '~/plugins/vue-lazyload', ssr: false },
    { src: '~/plugins/vue-scrollto', ssr: false },
    { src: '~/plugins/disqus' },
    { src: '~/plugins/mixins' }
  ],

  buildModules: [],

  modules: ['@nuxtjs/axios', '@nuxtjs/dotenv'],

  axios: {},

  build: {
    babel: {
      presets({ isServer }) {
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 }
            }
          ]
        ];
      }
    }
  },

  generate: {
    async routes() {
      let posts = await axios
        .get('https://wp.kmr.io/wp-json/wp/v2/posts', {
          params: { orderby: 'date', per_page: 1000000, _embed: null }
        })
        .then(res => {
          return res.data.map(post => {
            return {
              route: '/' + post.slug,
              payload: post
            };
          });
        });
      let pages = await axios
        .get('https://wp.kmr.io/wp-json/wp/v2/pages', {
          params: { orderby: 'date', per_page: 1000000, _embed: null }
        })
        .then(res => {
          return res.data.map(page => {
            return {
              route: '/pages/' + page.slug,
              payload: page
            };
          });
        });
      let topics = await axios
        .get('https://wp.kmr.io/wp-json/wp/v2/categories', { params: { per_page: 1000000 } })
        .then(res => {
          return res.data.map(topic => {
            return {
              route: '/topics/' + topic.slug,
              payload: topic
            };
          });
        });
      let authors = await axios
        .get('https://wp.kmr.io/wp-json/wp/v2/users', { params: { per_page: 1000000 } })
        .then(res => {
          return res.data.map(author => {
            return {
              route: '/authors/' + author.slug,
              payload: author
            };
          });
        });
      return Promise.all([posts, pages, topics, authors]).then(values => {
        return [...values[0], ...values[1], ...values[2], ...values[3]];
      });
    }
  }
};
