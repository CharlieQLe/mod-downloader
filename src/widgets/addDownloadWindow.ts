import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { Application } from 'resource:///io/github/charlieqle/ModDownloader/js/application.js';

export class AddDownloadWindow extends Adw.Window {
    private _urlRow!: Adw.EntryRow;
    private _downloadBtn!: Gtk.Button;

    private _application: Application;

    static {
        GObject.registerClass({
            GTypeName: 'AddDownloadWindow',
            Template: 'resource:///io/github/charlieqle/ModDownloader/ui/add-download-window.ui',
            InternalChildren: ['urlRow', 'downloadBtn'],
        }, this);
    }

    constructor(application: Application, transientFor: Gtk.Window) {
        super({ transientFor: transientFor });
        this._application = application;
    }

    public get url(): string {
        return this._urlRow.text.trim();
    }

    private onGoBackClicked(_: Gtk.Button) {
        this.destroy();
    }

    private onDownloadClicked(_: Gtk.Button) {
        this._application.download(this.url);
        this.destroy();
    }

    private onUrlChanged(_: Adw.EntryRow) {
        // TODO: Validate row
        this._downloadBtn.set_sensitive(this.url.length > 0);
    }
}