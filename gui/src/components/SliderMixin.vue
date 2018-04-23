<script>
export default {
	props: {
		'value': Number, 'min': Number, 'max': Number,
		'leftToRight':{
			type: Boolean,
			default: true
		}
	},
	data: ()=>({
		pmouseCoord: undefined,
		mouseupHandler: undefined,
		mousemoveHandler: undefined
	}),
	methods:{
		posToValue: function(){
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			const pos = Number(this.$refs.handle.style[this.handlePositionAttr].replace(/(px|%)$/,''))
			
			return Number(this.min) + ( ( this.leftToRight ? pos : (max - pos) )/max)*(Number(this.max) - Number(this.min))
		},
		valueToPos: function(val){
			const alpha = (val -  Number(this.min))/( Number(this.max) -  Number(this.min))
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			return`${ ( this.leftToRight ? alpha : (1.0 - alpha) ) * max}px`
		},
		moveHandle: function(e){
			if( this.mouseupHandler ){
				return
			}
			const newPos = e[this.mouseEventOffsetAttr] - this.$refs.handle[this.handleMetric] * 0.5
			this.$refs.handle.style[this.handlePositionAttr] = `${newPos}px`
			this.$emit('input', this.posToValue() )
		},
		grabHandle: function(e){
			this.pmouseCoord = e[this.mouseEventPositionAttr]
			this.mouseupHandler = this.releaseHandle.bind(this)
			document.addEventListener('mouseup', this.mouseupHandler )
			this.mousemoveHandler = this.onDrag.bind(this)
			document.addEventListener('mousemove', this.mousemoveHandler )
		},
		releaseHandle: function(){
			document.removeEventListener('mouseup', this.mouseupHandler )
			document.removeEventListener('mousemove', this.mousemoveHandler )
			this.mouseupHandler = undefined
			this.mousemoveHandler = undefined
			this.$emit('change', this.posToValue() )
		},
		onDrag: function(e){
			const delta = e[this.mouseEventPositionAttr] - this.pmouseCoord
			const pos = Number(this.$refs.handle.style[this.handlePositionAttr].replace(/(px|%)$/,''))
			const max = this.$refs.guide[this.guideMetric] - this.$refs.handle[this.handleMetric]
			const newPos = Math.max( 0, Math.min( max, pos+delta) )
			this.$refs.handle.style[this.handlePositionAttr] = `${newPos}px`
			this.pmouseCoord = e[this.mouseEventPositionAttr]
			this.$emit('input', this.posToValue() )
		}
	},
	watch: {
		value: function(newVal, oldVal){
			if(this.mousemoveHandler){ //don't update if currently holding the handle
				return
			}
			this.$refs.handle.style[this.handlePositionAttr] = this.valueToPos( newVal )
		}
	},
	mounted(){
			this.$refs.handle.style[this.handlePositionAttr] = this.valueToPos( this.value )
	}
}
</script>
