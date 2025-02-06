module.exports = {
    apps: [
      {
        name: "taiga-bot",
        script: "./index.js",
        instances: 2,  
        exec_mode: "cluster",
        watch: true,
        env: {
          NODE_ENV: "development"
        },
        env_production: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  