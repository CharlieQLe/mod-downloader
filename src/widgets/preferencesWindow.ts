import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

export class PreferencesWindow extends Adw.PreferencesWindow {
    private _nexusRow!: Adw.PasswordEntryRow;

    private _settings: Gio.Settings;

    static {
        GObject.registerClass({
            GTypeName: 'PreferencesWindow',
            Template: 'resource:///io/github/charlieqle/ModDownloader/ui/preferences-window.ui',
            InternalChildren: ['nexusRow'],
        }, this);
    }

    constructor() {
        super();
        this._settings = new Gio.Settings({ schemaId: "io.github.charlieqle.ModDownloader" });
        this._nexusRow.set_text(this._settings.get_string("nexus"));
    }

    private onNexusChanged(_: Adw.PasswordEntryRow) {
        this._settings.set_string("nexus", this._nexusRow.text);
    }
}