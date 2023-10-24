/**
 * @author lishibin
 * @desc 左/右侧树形布局收缩展开  目前只适合 el-col
 * @type {{data(): *, created(), methods: {}}}
 */
let mixin = {
    data() {
        return {
            arrowCfg: {
                left: 4,
                right: 20,
            },
        };
    },
    created() {
        let colorName = window.localStorage.getItem("saber-colorName")
        if(colorName){
            colorName = JSON.parse(colorName)
            let content = colorName['content']
            if(content){
                this.colorName = content;
            }
        }
    },
    computed:{
        arrowCfgClassLeftName(){
          return " iconfont  left_arw_icn arw_def_color";
        },
        arrowCfgClassRightName(){
          return "iconfont  right_arw_icn arw_def_color";
        },
        arrowCfgStyleCommon(){
          return "color:"+this.colorName + ";font-size:70px !important";
        },
    },
    methods: {

        // arrowCall(obj){
        //     this.colConfig = obj;
        // },
        // arrowLeft() {
        //     this.colConfig['left'] = 1;
        //     this.colConfig['right'] = 22;
        //     this.colConfig['expendLeft'] = false;

        // },
        // arrowRight() {
        //     this.colConfig['left'] = 5;
        //     this.colConfig['right'] = 18;
        //     this.colConfig['expendLeft'] = true;
        // },
        rightClick(){
            this.arrowCfg.left = 4;
            this.arrowCfg.right = 20;
        },
        leftClick(){
            this.arrowCfg.left = 0;
            this.arrowCfg.right = 24;
        },

    }
};
export default mixin;
