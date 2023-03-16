import Gio from 'gi://Gio';
import Soup from 'gi://Soup?version=3.0';

import { Application } from "resource:///io/github/charlieqle/ModDownloader/js/application.js";

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
    Gio._promisify(Soup.Session.prototype, 'send_and_read_async', 'send_and_read_finish');

    const application = new Application();
    return application.run(argv);
}