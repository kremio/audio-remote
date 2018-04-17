<template>
	<div ref="guide" v-on:mousedown="moveHandle">
		<span ref="handle" v-on:mousedown="grabHandle"></span>
	</div>
</template>

<script>
export default {
	props: ['value','min','max'],
	data: ()=>({
		pmouseY: undefined,
		mouseupHandler: undefined,
		mousemoveHandler: undefined
	}),
	methods:{
		posToValue: function(){
			const max = this.$refs.guide.offsetHeight - this.$refs.handle.offsetHeight
			const pos = Number(this.$refs.handle.style.top.replace(/(px|%)$/,''))
			
			return Number(this.min) + ((max - pos)/max)*(Number(this.max) - Number(this.min))
		},
		valueToPos: function(val){
			const alpha = (val -  Number(this.min))/( Number(this.max) -  Number(this.min))
			const max = this.$refs.guide.offsetHeight - this.$refs.handle.offsetHeight
			return `${(1.0 - alpha) * max}px`
		},
		moveHandle: function(e){
			if( this.mouseupHandler ){
				return
			}
			const newPos = e.offsetY - this.$refs.handle.offsetHeight * 0.5
			this.$refs.handle.style.top = `${newPos}px`
			this.$emit('input', this.posToValue() )
		},
		grabHandle: function(e){
			this.pmouseY = e.clientY
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
		},
		onDrag: function(e){
			const delta = e.clientY - this.pmouseY
			const pos = Number(this.$refs.handle.style.top.replace(/(px|%)$/,''))
			const max = this.$refs.guide.offsetHeight - this.$refs.handle.offsetHeight
			const newPos = Math.max( 0, Math.min( max, pos+delta) )
			this.$refs.handle.style.top = `${newPos}px`
			this.pmouseY = e.clientY
			this.$emit('input', this.posToValue() )
		}
	},
	watch: {
		value: function(newVal, oldVal){
			if(this.mousemoveHandler){ //don't update if currently holding the handle
				return
			}
			console.log('Set value', newVal, oldVal)
			this.$refs.handle.style.top = this.valueToPos( newVal )
		}
	},
	mounted(){
			this.$refs.handle.style.top = this.valueToPos( this.value )
	}
}
</script>

<style scoped>
	div {
		height:100%;
		position: relative;
		width:4px;
		background-color: blue;
		margin: 0 auto;
		border-radius: 2px;
	}

	span {
		display: block;
		width: 30px;
		height: 10px;
		background-color: grey;
		position: absolute;
		left: 50%;
		margin-left: -15px;
	}
</style>
