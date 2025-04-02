<template>
    <QLayout view="hHh lpR fFf">

        <QHeader elevated class="bg-primary text-white" height-hint="98">
            <QToolbar>
                <QBtn dense flat round icon="menu" @click="toggleLeftDrawer" />

                <QToolbarTitle>
                    <QAvatar>
                        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
                    </QAvatar>
                    Title
                </QToolbarTitle>

                <QBtn dense flat round icon="menu" />
            </QToolbar>

            <QTabs align="left">
                <QRouteTab to="/page1" label="Page One" />
                <QRouteTab to="/page2" label="Page Two" />
                <QRouteTab to="/page3" label="Page Three" />
            </QTabs>
        </QHeader>

        <QDrawer show-if-above side="left" bordered>
            <!-- drawer content -->
        </QDrawer>

        <QDrawer show-if-above side="right" bordered>
            <!-- drawer content -->
        </QDrawer>

        <QPageContainer>

        </QPageContainer>

        <QFooter elevated class="bg-grey-8 text-white">
            <QToolbar>
                <QToolbarTitle>
                    <QAvatar>
                        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
                    </QAvatar>
                    <div>Title</div>
                </QToolbarTitle>
            </QToolbar>
        </QFooter>

    </QLayout>
</template>

<script>
export default {
    name: 'Button',
};
</script>

<style scoped>
button {
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
}
</style>