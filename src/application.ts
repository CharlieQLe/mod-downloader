import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw?version=1';

import { Window } from "./widgets/window.js";

export class Application extends Adw.Application {
    private _mainWindow: Window | null;

    static {
        GObject.registerClass(this);
    }

    public constructor() {
        super({ application_id: pkg.name, flags: Gio.ApplicationFlags.FLAGS_NONE });
        this._mainWindow = null;

        // Add actions
        this._addAction('quit', _ => this.quit(), null);
        this._addAction('about', _ => new Adw.AboutWindow({
            transient_for: this._mainWindow,
            application_name: 'GNOME Typescript Template',
            application_icon: pkg.name,
            developer_name: 'Charlie Le',
            version: pkg.version,
            developers: ['Charlie Le'],
            copyright: '© 2023 Charlie Le'
        }).present(), null);

        // Set accels
        this.set_accels_for_action('app.quit', ['<primary>q']);
    }

    /// FUNCS

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