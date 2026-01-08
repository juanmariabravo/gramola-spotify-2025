import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogConfig } from '../dialog.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'custom-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './custom-dialog.html',
    styleUrls: ['./custom-dialog.css']
})
export class CustomDialog implements OnInit, OnDestroy {
    config: DialogConfig | null = null;
    private subscription?: Subscription;

    constructor(private dialogService: DialogService) { }

    ngOnInit(): void {
        this.subscription = this.dialogService.dialog$.subscribe(config => {
            this.config = config;
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    onConfirm(): void {
        this.dialogService.close(true);
    }

    onCancel(): void {
        this.dialogService.close(false);
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
            this.onCancel();
        }
    }
}
