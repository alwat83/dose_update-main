import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpgradeComponent } from './upgrade.component';

@NgModule({
  declarations: [UpgradeComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [UpgradeComponent]
})
export class UpgradeModule {}
