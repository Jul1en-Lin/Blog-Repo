+++
title = "Caffeine 介绍"
slug = "Caffeine-介绍"
date = "2026-09-03T14:56:16+08:00"
lastmod = "2026-09-03T14:56:16+08:00"
draft = false
description = "介绍 Caffeine 缓存库的基本特性、与 ConcurrentMap 的区别，以及异步刷新策略。"
categories = ["Java"]
tags = ["Java", "Caffeine", "缓存"]
obsidian_path = "/Caffeine/Caffeine 介绍"
+++
# Caffeine 介绍

以下介绍基于官方 wiki 解释

Caffeine 是一个基于 Java 8 开发的提供了[近乎最佳](https://github.com/ben-manes/caffeine/wiki/Efficiency-zh-CN)命中率的[高性能](https://github.com/ben-manes/caffeine/wiki/Benchmarks-zh-CN)的缓存库。

Caffeine 提供了灵活的构造器去创建一个拥有下列特性的缓存：

- [自动加载](https://github.com/ben-manes/caffeine/wiki/Population-zh-CN)元素到缓存当中，异步加载的方式也可供选择
- 当达到最大容量的时候可以使用基于[就近度和频率](https://github.com/ben-manes/caffeine/wiki/Efficiency-zh-CN)的算法进行[基于容量的驱逐](https://github.com/ben-manes/caffeine/wiki/Eviction-zh-CN#%E5%9F%BA%E4%BA%8E%E5%AE%B9%E9%87%8F)
- 将根据缓存中的元素上一次访问或者被修改的时间进行[基于过期时间的驱逐](https://github.com/ben-manes/caffeine/wiki/Eviction-zh-CN#%E5%9F%BA%E4%BA%8E%E6%97%B6%E9%97%B4)
- 当向缓存中一个已经过时的元素进行访问的时候将会进行[异步刷新](https://github.com/ben-manes/caffeine/wiki/Refresh-zh-CN)
- key 将自动被[弱引用](https://github.com/ben-manes/caffeine/wiki/Eviction-zh-CN#%E5%9F%BA%E4%BA%8E%E5%BC%95%E7%94%A8)所封装
- value 将自动被[弱引用或者软引用](https://github.com/ben-manes/caffeine/wiki/Eviction-zh-CN#%E5%9F%BA%E4%BA%8E%E5%BC%95%E7%94%A8)所封装
- 驱逐(或移除)缓存中的元素时将会进行[通知](https://github.com/ben-manes/caffeine/wiki/Removal-zh-CN)
- [写入传播](https://github.com/ben-manes/caffeine/wiki/Writer-zh-CN)到一个外部数据源当中
- 持续计算缓存的访问[统计指标](https://github.com/ben-manes/caffeine/wiki/Statistics-zh-CN)

为了提高集成度，扩展模块提供了 [JSR-107 JCache](https://github.com/ben-manes/caffeine/wiki/JCache-zh-CN)和[Guava](https://github.com/ben-manes/caffeine/wiki/Guava-zh-CN) 适配器。JSR-107 规范了基于 Java 6 的 API，在牺牲了功能和性能的代价下使代码更加规范。Guava 的 Cache 是 Caffeine 的原型库并且 Caffeine 提供了适配器以供简单的迁移策略。

## 与 ConcurrentMap 的区别

缓存和 ConcurrentMap 有点相似，但还是有所区别。最根本的区别是 [ConcurrentMap](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentMap.html) 将会持有所有加入到缓存当中的元素，直到它们被从缓存当中手动移除。但是，Caffeine 的缓存 `Cache` 通常会被配置成自动驱逐缓存中元素，以限制其内存占用。在某些场景下，`LoadingCache` 和 `AsyncLoadingCache` 因为其自动加载缓存的能力将会变得非常实用。

展开记几个具体方面：

**内存限制：** ConcurrentMap 没有容量概念，放进去多少就持有多少，清理全靠手动 `remove`，忘了删就一直占着堆。`Cache` 从设计上就把清理纳入自身职责，`maximumSize`、`expireAfterWrite` 这些配置让内存占用有上限。

**自动淘汰机制：** 缓存满了要淘汰掉谁？Caffeine 按访问频率和新近度（W-TinyLFU 算法）挑选牺牲品，热门数据留存，一阵扫描式查询也不会把热数据冲掉。

**过期判定：** 过期的键值对不会在到期那一瞬间消失，读取时才判定，清理由后台任务异步执行。语义上读不到过期值，行为是对的，只是 `estimatedSize()` 可能短暂偏大。

**自动加载：** `LoadingCache` 在 miss 时自动执行 loader，查缓存、只需填一行 `get(key)` 。

## 异步刷新策略

```java
LoadingCache<Key, Graph> graphs = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .refreshAfterWrite(Duration.ofMinutes(1))
    .build(key -> createExpensiveGraph(key));
```

刷新和驱逐并不相同。可以通过 `LoadingCache.refresh(K)` 方法，异步为 key 对应的缓存元素刷新一个新的值。与驱逐不同的是，在刷新的时候如果查询缓存元素，其旧值将仍被返回，直到该元素的刷新完毕后结束后才会返回刷新后的新值。

与 `expireAfterWrite` 相反，`refreshAfterWrite` 将会使在写操作之后的一段时间后允许 key 对应的缓存元素进行刷新，但是只有在这个 key 被真正查询到的时候才会正式进行刷新操作。所以打个比方，你可以在同一个缓存中同时用到 `refreshAfterWrite` 和 `expireAfterWrite` ，这样缓存元素的在被允许刷新的时候不会直接刷新使得过期时间被盲目重置。当一个元素在其被允许刷新但是没有被主动查询的时候，这个元素也会被视为过期。

一个 `CacheLoader` 可以通过覆盖重写 `CacheLoader.reload(K, V)` 方法使得在刷新中可以将旧值也参与到更新的过程中去，这也使得刷新操作显得更加智能。

`LoadingCache.refresh(K)` 可用于显式刷新条目，并在请求飞行时重复请求。返回的未来值可用于实现后备缓存，在后备缓存中，条目会被重新加载以从源获取最新值，但如果失败，则会查找并返回缓存值。

更新操作将会异步执行在一个 [Executor](http://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Executor.html)上。默认的线程池实现是[ForkJoinPool.commonPool()](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ForkJoinPool.html) 当然也可以通过覆盖 `Caffeine.executor(Executor)` 方法自定义线程池的实现。

在刷新的过程中，如果抛出任何异常，都会使旧值被保留，并且异常将会被打印日志 (通过 [System.Logger](http://docs.oracle.com/javase/8/docs/api/java/util/logging/package-summary.html) )并被吞食。
