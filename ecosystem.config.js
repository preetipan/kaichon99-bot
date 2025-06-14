module.exports = {
    apps: [
      {
        name: "kaichon99-bot",
        script: "./index.js",
        instances: 3,  
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
  