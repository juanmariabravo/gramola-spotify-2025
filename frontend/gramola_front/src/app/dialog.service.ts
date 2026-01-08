import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    confirmText?: string;
    cancelText?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private dialogSubject = new BehaviorSubject<DialogConfig | null>(null);
    public dialog$ = this.dialogSubject.asObservable();

    private resolveFunction?: (value: boolean) => void;

    // Show an alert dialog, returns a promise that resolves when the user acknowledges
    alert(message: string, title: string = 'Información'): Promise<boolean> {
        return this.showDialog({
            title,
            message,
            type: 'alert',
            confirmText: 'Aceptar'
        });
    }

    // Show a confirmation dialog, returns a promise that resolves to true if accepted, false if cancelled
    confirm(message: string, title: string = 'Confirmación'): Promise<boolean> {
        return this.showDialog({
            title,
            message,
            type: 'confirm',
            confirmText: 'Aceptar',
            cancelText: 'Cancelar'
        });
    }

    private showDialog(config: DialogConfig): Promise<boolean> {
        return new Promise((resolve) => {
            this.resolveFunction = resolve;
            this.dialogSubject.next(config);
        });
    }

    close(result: boolean): void {
        this.dialogSubject.next(null);
        if (this.resolveFunction) {
            this.resolveFunction(result);
            this.resolveFunction = undefined;
        }
    }
}
