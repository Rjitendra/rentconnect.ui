import { Injectable, TemplateRef } from '@angular/core';

import {
  SelectOption,
  TableColumn,
  UploadedFile,
} from '../../../../projects/shared/src/public-api';
import { IUserDetail } from '../../oauth/service/oauth.service';
import { documentCategories } from '../constants/document.constants';
import {
  furnishingTypeOptions,
  leaseTypeOptions,
  propertyTypeOptions,
} from '../constants/properties.constants';
import {
  DocumentCategory,
  FurnishingType,
  LeaseType,
  PropertyStatus,
  PropertyType,
} from '../enums/view.enum';
import { IDocument } from '../models/document';
import { IProperty, TransformedProperty } from '../models/property';
import { ITenant } from '../models/tenant';

@Injectable({
  providedIn: 'root',
})
export class PropertyDashboardService {
  // New methods for Property Detail component
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Not specified';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0';
    return amount.toLocaleString('en-IN');
  }

  getPropertyType(propertyTypes: PropertyType): string {
    return propertyTypeOptions[propertyTypes].label;
  }

  getFurnishingType(furnishTypes: FurnishingType): string {
    return furnishingTypeOptions[furnishTypes].label;
  }

  getLeaseType(leaseTypes: LeaseType): string {
    return leaseTypeOptions[leaseTypes].label;
  }
  getStatusInfo(status: PropertyStatus): {
    class: string;
    icon: string;
  } {
    switch (status) {
      case PropertyStatus.Listed:
        return { class: 'status-listed', icon: 'visibility' };
      case PropertyStatus.Draft:
        return { class: 'status-draft', icon: 'edit' };
      case PropertyStatus.Rented:
        return { class: 'status-rented', icon: 'home' };
      case PropertyStatus.Archived:
        return { class: 'status-archived', icon: 'archive' };
      default:
        return { class: 'status-unknown', icon: 'help_outline' };
    }
  }

  getCategoryIcon(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.OwnershipProof:
        return 'home_work';
      case DocumentCategory.UtilityBill:
        return 'receipt_long';
      case DocumentCategory.PropertyImages:
        return 'photo_library';
      case DocumentCategory.NoObjectionCertificate:
        return 'verified';
      default:
        return 'upload_file';
    }
  }

  getCategoryHint(category: DocumentCategory): string {
    switch (category) {
      case DocumentCategory.OwnershipProof:
        return 'Property ownership documents, sale deed, or title documents';
      case DocumentCategory.UtilityBill:
        return 'Electricity, water, gas, or other utility bills';
      case DocumentCategory.PropertyImages:
        return 'Property photos, floor plans, or virtual tour images';
      case DocumentCategory.NoObjectionCertificate:
        return 'No objection certificates from authorities';
      default:
        return 'Upload relevant documents';
    }
  }

  // Data transformation methods
  transformPropertyForTable(property: IProperty): TransformedProperty {
    return {
      ...property,
      fullAddress: this.getFullAddress(property),
      mappedTenants: this.getMappedTenantsDisplay(property.tenants || []),
      documentsCount: this.getDocumentsDisplay(property.documents || []),
      createdOn: property.createdOn
        ? new Date(property.createdOn).toLocaleDateString()
        : 'N/A',
    };
  }

  // UI utility methods
  getStatusIcon(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'check_circle';
      case PropertyStatus.Rented:
        return 'people';
      case PropertyStatus.Archived:
        return 'delete';
      case PropertyStatus.Draft:
        return 'edit';
      default:
        return 'info';
    }
  }

  getSimplifiedStatus(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'LISTED';
      case PropertyStatus.Rented:
        return 'RENTED';
      case PropertyStatus.Archived:
        return 'Archived';
      case PropertyStatus.Draft:
        return 'Draft';
      default:
        return 'LISTED';
    }
  }

  getSimplifiedStatusIconColor(status: PropertyStatus): string {
    switch (status) {
      case PropertyStatus.Listed:
        return 'icon-info';
      case PropertyStatus.Rented:
        return 'icon-success';
      case PropertyStatus.Archived:
        return 'icon-error ';
      case PropertyStatus.Draft:
        return 'icon-warning';
      default:
        return 'icon-warning';
    }
  }

  // New method added here 👇
  getCategoryInfo(category: DocumentCategory): {
    icon: string;
    label: string;
    hint: string;
  } {
    switch (category) {
      case DocumentCategory.OwnershipProof:
        return {
          icon: 'home_work',
          label: 'Ownership Proof',
          hint: 'Property ownership documents, sale deed, or title documents',
        };
      case DocumentCategory.UtilityBill:
        return {
          icon: 'receipt_long',
          label: 'Utility Bills',
          hint: 'Electricity, water, gas, or other utility bills',
        };
      case DocumentCategory.PropertyImages:
        return {
          icon: 'photo_library',
          label: 'Property Photos',
          hint: 'Property photos, floor plans, or virtual tour images',
        };
      case DocumentCategory.NoObjectionCertificate:
        return {
          icon: 'verified',
          label: 'NOC Certificate',
          hint: 'No objection certificates from authorities',
        };
      default:
        return {
          icon: 'upload_file',
          label: 'Unknown Category',
          hint: 'Upload relevant documents',
        };
    }
  }

  getCategoryLabel(category: DocumentCategory | string): string {
    const categoryOption = documentCategories.find((c) => c.value === category);
    return categoryOption?.label || 'Unknown Category';
  }

  getDownloadCategoryOptions(documents: IDocument[] = []): SelectOption[] {
    const categories = [
      {
        value: 'all',
        label: `All Documents (${documents.length})`,
      },
    ];

    documentCategories.forEach((cat) => {
      const count = documents.filter((d) => d.category === cat.value).length;
      categories.push({
        value: cat.value,
        label: `${cat.label} (${count})`,
      });
    });

    return categories;
  }

  getDocumentCategoryOptions(): SelectOption[] {
    return [{ value: 'all', label: 'All Documents' }, ...documentCategories];
  }

  initializeTableColumns(
    propertyNameTemplate: TemplateRef<unknown>,
    tenantTemplate: TemplateRef<unknown>,
    documentTemplate: TemplateRef<unknown>,
    actionTemplate: TemplateRef<unknown>,
    statusTemplate: TemplateRef<unknown>,
  ): TableColumn[] {
    return [
      {
        key: 'id',
        label: 'ID',
        width: '80px',
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'title',
        label: 'Property Name',
        width: 'auto',
        type: 'custom',
        template: propertyNameTemplate,
        align: 'left',
      },
      { key: 'fullAddress', label: 'Address', width: 'auto', align: 'left' },
      {
        key: 'mappedTenants',
        label: 'Tenants',
        width: '300px',
        type: 'custom',
        template: tenantTemplate,
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'documentsActions',
        label: 'Documents',
        width: '150px',
        type: 'custom',
        template: documentTemplate,
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'monthlyRent',
        label: 'Monthly Rent',
        width: '120px',
        align: 'right',
        headerAlign: 'right',
      },
      {
        key: 'status',
        label: 'Status',
        width: '150px',
        type: 'custom',
        template: statusTemplate,
        align: 'center',
        headerAlign: 'center',
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '200px',
        type: 'custom',
        template: actionTemplate,
        align: 'center',
        headerAlign: 'center',
      },
    ];
  }

  createDocumentFormData(
    files: UploadedFile[],
    property: IProperty,
    category: DocumentCategory,
    user: Partial<IUserDetail>,
  ): FormData {
    const formData = new FormData();
    files.forEach((uploadedFile, index) => {
      formData.append(`Documents[${index}].File`, uploadedFile.file);
      formData.append(
        `Documents[${index}].OwnerId`,
        (property.landlordId || Number(user.userId) || 1).toString(),
      );
      formData.append(`Documents[${index}].OwnerType`, 'Landlord');
      formData.append(`Documents[${index}].Category`, category.toString());
      formData.append(
        `Documents[${index}].LandlordId`,
        (property.landlordId || Number(user.userId) || 1).toString(),
      );
      formData.append(
        `Documents[${index}].PropertyId`,
        property.id!.toString(),
      );
      formData.append(`Documents[${index}].Name`, uploadedFile.name);
      formData.append(`Documents[${index}].Size`, uploadedFile.size.toString());
      formData.append(`Documents[${index}].Type`, uploadedFile.type);
      formData.append(
        `Documents[${index}].DocumentIdentifier`,
        `PROP-DOC-${Date.now()}-${index}`,
      );
      formData.append(
        `Documents[${index}].UploadedOn`,
        new Date().toISOString(),
      );
      formData.append(`Documents[${index}].IsVerified`, 'false');
      formData.append(
        `Documents[${index}].Description`,
        `${this.getCategoryLabel(category)} document for ${property.title}`,
      );
    });
    return formData;
  }

  private getFullAddress(property: IProperty): string {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      property.locality,
      property.city,
      property.state,
      property.pinCode,
    ].filter((part) => part && part.trim());
    return parts.join(', ');
  }

  private getMappedTenantsDisplay(tenants: ITenant[]): string {
    if (!tenants || tenants.length === 0) return 'No tenants';
    if (tenants.length === 1) return tenants[0].name || 'Unnamed Tenant';
    return `${tenants.length} tenants`;
  }

  private getDocumentsDisplay(documents: IDocument[]): string {
    if (!documents || documents.length === 0) return 'No documents';
    return `${documents.length} document${documents.length === 1 ? '' : 's'}`;
  }
}
