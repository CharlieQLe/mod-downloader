import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

import { Application } from 'resource:///io/github/charlieqle/ModDownloader/js/application.js';
import { AddDownloadWindow } from 'resource:///io/github/charlieqle/ModDownloader/js/widgets/addDownloadWindow.js';

export class Window extends Adw.ApplicationWindow {
    private _downloadingGroup!: Adw.PreferencesGroup;
    private _queuedGroup!: Adw.PreferencesGroup;
    private _finishedGroup!: Adw.PreferencesGroup;

    private _application: Application;

    static {
        GObject.registerClass({
            GTypeName: 'Window',
            Template: 'resource:///io/github/charlieqle/ModDownloader/ui/window.ui',
            InternalChildren: ['downloadingGroup', 'queuedGroup', 'finishedGroup']
        }, this);
    }

    constructor(application: Application) {
        super({ application });
        this._application = application;
    }

    private onAddDownloadClicked(_: Gtk.Button) {
        new AddDownloadWindow(this._application, this).show();
    }
}