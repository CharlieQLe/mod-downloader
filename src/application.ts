import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Adw from 'gi://Adw?version=1';

import { Window } from "resource:///io/github/charlieqle/ModDownloader/js/widgets/window.js";
import { PreferencesWindow } from 'resource:///io/github/charlieqle/ModDownloader/js/widgets/preferencesWindow.js';

import { NexusSession } from 'resource:///io/github/charlieqle/ModDownloader/js/sessions/nexus.js';

export class Application extends Adw.Application {
    private _mainWindow: Window | null;
    private _apiKey: string;

    static {
        GObject.registerClass(this);
    }

    public constructor() {
        super({ application_id: pkg.name, flags: Gio.ApplicationFlags.FLAGS_NONE });
        this._mainWindow = null;

        const settings = new Gio.Settings({ schemaId: "io.github.charlieqle.ModDownloader" });
        this._apiKey = settings.get_string('nexus');

        const session = new NexusSession(this._apiKey);
        session.getValidateAsync()
            .then(([_, res]) => log(`User is ${res.name}, success!`))
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
        url = url.substring(6);

        log(url);

        // TODO: Handle downloading
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