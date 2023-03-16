import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Adw from 'gi://Adw?version=1';

import { Window } from "resource:///io/github/charlieqle/ModDownloader/js/widgets/window.js";
import { PreferencesWindow } from 'resource:///io/github/charlieqle/ModDownloader/js/widgets/preferencesWindow.js';

import { NexusSession, handleNxmUri } from 'resource:///io/github/charlieqle/ModDownloader/js/sessions/nexus.js';

export class Application extends Adw.Application {
    private _mainWindow: Window | null;
    private _session: NexusSession;

    static {
        GObject.registerClass(this);
    }

    public constructor() {
        super({ application_id: pkg.name, flags: Gio.ApplicationFlags.FLAGS_NONE });
        this._mainWindow = null;

        const settings = new Gio.Settings({ schemaId: "io.github.charlieqle.ModDownloader" });
        this._session = new NexusSession(settings.get_string('nexus'));
        this._session.getValidateAsync()
            .then(([, res]) => log(`User is ${res.name}, success!`))
            .catch(error => log(error));

        // Add actions
        this._addAction('quit', _ => this.quit(), null);
        this._addAction('about', _ => new Adw.AboutWindow({
            transient_for: this._mainWindow,
            application_name: 'Mod Downloader',
            application_icon: pkg.name,
            developer_name: 'Charlie Le',
            version: pkg.version,
            developers: ['Charlie Le'],
            copyright: '© 2023 Charlie Le'
        }).present(), null);
        this._addAction('preferences', _ => new PreferencesWindow().present(), null);

        // Set accels
        this.set_accels_for_action('app.quit', ['<primary>q']);
    }

    /// FUNCS

    public download(url: string) {
        const components = handleNxmUri(url);
        this._session.getModFileAsync(components.fileId, components.modId, components.gameDomainName)
            .then(async([, modFile]) => {
                const [, links] = await this._session.getDownloadLinkAsync(components.fileId, components.modId, components.gameDomainName, components.key, components.expires);
                if (links.length === 0) throw new Error('No download links available!');
                const link = links[0].URI;
                log(`Downloading file from ${link}`);
                await this._session.downloadFileAsync(link, modFile.file_name);
                log('Finished download!');
            })
            .catch(error => log(error));
    }

    private _addAction(name: string, callback: (action: Gio.SimpleAction, ...params: any[]) => void, parameterType: GLib.VariantType<any> | null) {
        const action = Gio.SimpleAction.new(name, parameterType);
        action.connect('activate', callback);
        this.add_action(action);
        return action;
    }

    /// VFUNCS

    public vfunc_activate() {
        if (this._mainWindow == null) this._mainWindow = new Window(this);
        this._mainWindow.present();
    }
}