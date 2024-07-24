/* eslint-disable no-console */
import app from './app';
import { Config } from './config';

const startServer = () => {
    try {
        app.listen(Config.PORT, () =>
            console.log(`Listening on port ${Config.PORT}`),
        );
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
