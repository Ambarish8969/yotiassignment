import { LightningElement, wire } from 'lwc';
import getRequests from '@salesforce/apex/ESignRequestController.getRequests';
import getCounts from '@salesforce/apex/ESignRequestController.getCounts';
import { NavigationMixin } from 'lightning/navigation';

const PAGE_SIZE = 10;

const COLUMNS = [
    { 
        label: 'Envelope name',
        type: 'button',
        hideDefaultActions: true,
        typeAttributes: {
            label: { fieldName: 'Name' },
            name: 'viewRecord',
            variant: 'base'
        }
    },
    { label: 'Sent to', fieldName: 'Sent_to__c', type: 'text' },
    {
        label: 'Signing status',
        fieldName: 'Signing_Status__c',
        type: 'text',
        cellAttributes: {
            iconName: { fieldName: 'statusIcon' },
            class: { fieldName: 'statusClass' }
        }
    },
    {
        label: 'Sent on',
        fieldName: 'Sent_On__c',
        type: 'date-local',
        typeAttributes: { year: 'numeric', month: 'short', day: '2-digit' }
    },
    {
        label: '',
        fieldName: 'viewUrl',
        type: 'url',
        typeAttributes: { label: 'View details', target: '_blank' }
    }
];

export default class EsignRequestList extends NavigationMixin(LightningElement) {

    pageNumber = 1;
    totalCount = 0;
    rows = [];
    error;

    columns = COLUMNS;

    @wire(getCounts)
    wiredCounts({ error, data }) {
        if (data) {
            this.totalCount = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.totalCount = 0;
        }
    }

    @wire(getRequests, { pageNumber: '$pageNumber', pageSize: PAGE_SIZE })
    wiredRequests({ error, data }) {
        if (data) {
            this.rows = data.map((r) => ({
                ...r,
                viewUrl: 'https://www.yoti.com',
                statusIcon: r.Signing_Status__c === 'Signed' ? 'utility:success' : 'utility:info',
                statusClass: r.Signing_Status__c === 'Signed' ? 'slds-text-color_success' : 'slds-text-color_weak'
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.rows = [];
        }
    }

    handleRowAction(event) {
        if (event.detail.action.name === 'viewRecord') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: event.detail.row.Id,
                    objectApiName: 'eSign_Request__c',
                    actionName: 'view',
                    target: '_blank'
                }
            });
        }
    }
    
    handleNext() {
        if (this.pageNumber * PAGE_SIZE < this.totalCount) {
            this.pageNumber++;
        }
    }

    handlePrevious() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
        }
    }

    get startIndex() {
        return (this.pageNumber - 1) * PAGE_SIZE + 1;
    }

    get endIndex() {
        return Math.min(this.pageNumber * PAGE_SIZE, this.totalCount);
    }

    get rangeIndex() {
        return `${this.startIndex}-${this.endIndex} of ${this.totalCount}`;
    }

    get isFirstPage() {
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber >= this.totalPages;
    }

}