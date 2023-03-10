import template from './extension/sw-customer-list/sw-customer-list.html.twig'
import './extension/sw-customer-list/sw-customer-list.scss'

Shopware.Component.override('sw-customer-list', {
    template,

    inject: ['repositoryFactory'],

    data() {
        return {
            customerGroupId: null,
            disabled: true,
            isLoadingCustomers: false,
        }
    },

    computed: {
        customerGroupCriteria() {
            const criteria = new Shopware.Data.Criteria(1, 100);

            criteria.addSorting(Shopware.Data.Criteria.sort('name', 'ASC', false));

            return criteria;
        },

        downloadLink() {
            return '<link_to_download>' + (this.customerGroupId || '')
        },
        
        repository() {
            return this.repositoryFactory.create('customer');
        },
    },

    methods: {
        onCustomerGroupChange(newCustomerGroupId) {
            this.disabled = false
            this.customerGroupId = newCustomerGroupId
        },

        async onDownload() {
            this.isLoadingCustomers = true

            const customers = await this.getCustomers(this.customerGroupId)
            const csv = await this.convertToCSV(customers)

            this.download('mailchimp_export.csv', csv)

            this.isLoadingCustomers = false
        },

        async getCustomers(groupId) {
            const criteria = new Shopware.Data.Criteria(1, Number.MAX_SAFE_INTEGER)

            if (groupId) {
                criteria.addFilter(Shopware.Data.Criteria.equals('groupId', groupId))
            }

            return await this.repository.search(criteria, Shopware.Context.api)
        },

        async convertToCSV(customers) {
            const csv = customers.map(row => 
                [
                    row.email,
                    row.lastName,
                    row.firstName,
                ].join(',')
            )

            return csv.join('\n')
        },

        download(filename, text) {
            const element = document.createElement('a')

            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
            element.setAttribute('download', filename)
          
            element.style.display = 'none'
            document.body.appendChild(element)
          
            element.click()
          
            document.body.removeChild(element)
        }
    }
})