import Gio from 'gi://Gio';
import Soup from 'gi://Soup?version=3.0';

import { Application } from "resource:///io/github/charlieqle/ModDownloader/js/application.js";

pkg.initGettext();
pkg.initFormat();

export function main(argv: string[]) {
    Gio._promisify(Gio.File.prototype, 'create_async', 'create_finish');
    Gio._promisify(Gio.File.prototype, 'delete_async', 'delete_finish');
    Gio._promisify(Gio.FileOutputStream.prototype, 'close_async', 'close_finish');
    Gio._promisify(Gio.FileOutputStream.prototype, 'write_bytes_async', 'write_bytes_finish');
    Gio._promisify(Soup.Session.prototype, 'send_and_read_async', 'send_and_read_finish');

    const application = new Application();
    return application.run(argv);
}