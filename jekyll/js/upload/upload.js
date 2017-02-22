/**
 * Created by renerodriguez on 2/27/16.
 */

/* globals FormData, Vue */

Vue.component('ajax-form', {
    template: '<form id="[{id }]" class="[{class}]" name="[{ name }]" action="[{ action }]" method="[{ method }]" :submit.prevent="handleAjaxFormSubmit" @change="onFileChange"><slot></slot></form>',
    props: {
        id: String,
        class: String,
        action: {
            type: String,
            required: true
        },
        method: {
            type: String,
            required: true,
            validator: function(value){
                switch(value.toUpperCase()){
                    case 'POST': return true
                    default: return false
                }
            }
        },
        'response-type': String
    },
    data () {
        return {
            fileName: '',
            fileData: null
        }
    },
    methods: {
        onFileChange: function (e) {
            //e.preventDefault();
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;

            //capture values from file
            var fileNameString = files[0].name;
            if (fileNameString.indexOf('.xlsx') < 0) {
                // fires when files has been loaded
                this.$dispatch('NotifyWrongFile');
            }else{
                this.fileName = files[0].name;
                this.fileData = files[0];
            }


            // fires when files has been loaded
            // this.$dispatch('getFilesName', this.fileName);

            this.$emit('filename', this.fileName)


        },
        handleAjaxFormSubmit: function() {

            // fires whenever an error occurs
            var handleError = (function(err) {
                this.$dispatch('onFormError', this, err);
            }).bind(this);

            // set a default form method
            if (!this.method) {
                this.method = 'post';
            }

            // fires when the form returns a result
            var handleFinish = (function(data) {
                if (xhr.readyState == 4) {
                    // a check to make sure the result was a success
                    if (xhr.status < 400) {
                        this.$dispatch('onFormComplete', this, xhr.response);
                        this.fileData = null;
                        this.fileName = null;
                    } else {
                        this.$dispatch('onFormError', this, xhr.statusText);
                    }
                }
            }).bind(this);

            var handleProgress = (function(evt) {
                // flag indicating if the resource has a length that can be calculated
                if (evt.lengthComputable) {
                    // create a new lazy property for percent
                    evt.percent = (evt.loaded / evt.total) * 100;

                    this.$dispatch('onFormProgress', this, evt);
                }
            }).bind(this);

            var xhr = new XMLHttpRequest();
            xhr.open(this.method, this.action, true);

            // you can set the form response type via v-response-type
            if (this.vResponseType) {
                xhr.responseType = this.responseType;
            } else {
                xhr.responseType = 'json';
            }

            xhr.upload.addEventListener('progress', handleProgress);
            xhr.addEventListener('readystatechange', handleFinish);
            xhr.addEventListener('error', handleError);
            xhr.addEventListener('abort', handleError);
            var data = new FormData();

            data.append('xls_file', this.fileData);



            //Check if there's data
            if(this.fileData){
                xhr.send(data);
            }

            // we have setup all the stuff we needed to
            this.$dispatch('afterFormSubmit', this);
        }
    }
});

// register
// Vue.component('ajax-form', AjaxFormComponent);


var uploadFile = new Vue({
    el: '#uploadPage',
    name: 'UploadPage',
    delimiters: ['[{', '}]'],
    data: {
        response: {},
        progress: 0,
        showProgess: true,
        uploadMessage: '',
        fileName: '',
        hovering: true,
        auth: auth,
        type: 'json'
    },
    mounted: function (){

        //Check if authenticated, if not go to log in page
        if(auth.user.required){
            auth.checkAuth();
        }

        componentHandler.upgradeDom();
    },
    events: {
        NotifyWrongFile: function(){
            this.uploadMessage = "This file is not a valid XLSForm .xlsx file.";
            //toaster
            var toastOptions = {
                style: {
                    main: {
                        background: "#f2dede",
                        color: "#a94442",
                        'box-shadow': '0 0 0px'
                    }
                }
            };
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);
        },
        afterFormSubmit: function(el) {
            // fired after fetch is called
            console.log('afterFormSubmit', el);
        },
        onFormComplete: function(el, res) {
            // the form is done, but there could still be errors
            console.log('onFormComplete', el, res);
            // indicate the changes
            this.response = res;

            //Success message
            this.uploadMessage = "Uploaded " + this.fileName + " successfully";
            //reset values
            this.progress = 0;
            this.fileName = '';
            //toaster
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);

        },
        onFormProgress: function(el, e) {
            // the form is done, but there could still be errors
            console.log('onFormProgress', el, e);
            // indicate the changes
            this.progress = e.percent;
        },
        onFormError: function(el, err) {
            // handle errors
            console.log('onFormError', el, err);
            // indicate the changes
            //Failed message
            this.uploadMessage = "Failed uploading" + this.fileName + " file";
            this.response = err;

            //toaster
            var toastOptions = {
                style: {
                    main: {
                        background: "#f2dede",
                        color: "#a94442",
                        'box-shadow': '0 0 0px'
                    }
                }
            };
            iqwerty.toast.Toast(this.uploadMessage, toastOptions);
        }
    },
    created() {
        this.$on('filename', function(id){
            console.log('Event from parent component emitted', id)
        });
    },
    methods: {

        filename: function(name){
            this.fileName = name;
        },

    }
})

var toastOptions = {
    style: {
        main: {
            background: "#7ebc6f",
            color: "white",
            'box-shadow': '0 0 0px'
        }
    }
};
